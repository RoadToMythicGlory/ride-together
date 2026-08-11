<?php
/**
 * Honeypot trap — logs proxy IP chain + geolocation, then blocks attacker web IP.
 * Owner protection = signed secret cookie (survives dynamic ISP IPs), not IP whitelist.
 * Does NOT touch SSH.
 */
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require HP_ROOT . '/auth.php';

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

function hp_ip_in_cidrs(string $ip, array $cidrs): bool
{
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        return false;
    }
    $ipLong = ip2long($ip);
    foreach ($cidrs as $cidr) {
        [$subnet, $mask] = array_pad(explode('/', $cidr, 2), 2, '32');
        if (!filter_var($subnet, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) || !ctype_digit((string) $mask)) {
            continue;
        }
        $mask = (int) $mask;
        $maskLong = $mask === 0 ? 0 : (-1 << (32 - $mask));
        if (($ipLong & $maskLong) === (ip2long($subnet) & $maskLong)) {
            return true;
        }
    }
    return false;
}

function hp_is_cloudflare_ip(string $ip): bool
{
    static $cf = [
        '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
        '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
        '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
        '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
    ];
    return hp_ip_in_cidrs($ip, $cf);
}

function hp_block_targets(string $peer, array $sources): array
{
    $targets = [];
    $viaCf = $peer !== '' && hp_is_cloudflare_ip($peer);

    if ($viaCf) {
        foreach (['CF-Connecting-IP', 'True-Client-IP'] as $hdr) {
            foreach ($sources as $ip => $claimed) {
                if (in_array($hdr, $claimed, true) && hp_is_public_ip($ip) && !hp_is_cloudflare_ip($ip)) {
                    $targets[$ip] = 'trusted_header:' . $hdr;
                }
            }
        }
    } elseif ($peer !== '' && hp_is_public_ip($peer)) {
        $targets[$peer] = 'tcp_peer';
    }

    return $targets;
}

function hp_collect_ip_chain(): array
{
    $headers = [
        'CF-Connecting-IP', 'True-Client-IP', 'X-Real-IP', 'X-Client-IP',
        'X-Cluster-Client-IP', 'Forwarded', 'X-Forwarded-For', 'X-Forwarded',
        'Forwarded-For', 'Via',
    ];

    $chain = [];
    $sources = [];

    $peer = hp_normalize_ip($_SERVER['REMOTE_ADDR'] ?? '');
    if ($peer) {
        $chain[] = $peer;
        $sources[$peer][] = 'REMOTE_ADDR';
    }

    foreach ($headers as $name) {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        $raw = $_SERVER[$key] ?? '';
        if ($raw === '') {
            continue;
        }

        if (strcasecmp($name, 'Forwarded') === 0) {
            if (preg_match_all('/for=(?:"?\[?)([^;"\]]+)/i', $raw, $mm)) {
                foreach ($mm[1] as $cand) {
                    $ip = hp_normalize_ip($cand);
                    if ($ip) {
                        $chain[] = $ip;
                        $sources[$ip][] = $name;
                    }
                }
            }
            continue;
        }

        foreach (preg_split('/\s*,\s*/', $raw) as $part) {
            $ip = hp_normalize_ip($part);
            if (!$ip && preg_match('/(\d{1,3}(?:\.\d{1,3}){3})/', $part, $m)) {
                $ip = hp_normalize_ip($m[1]);
            }
            if ($ip) {
                $chain[] = $ip;
                $sources[$ip][] = $name;
            }
        }
    }

    $unique = [];
    foreach ($chain as $ip) {
        $unique[$ip] = true;
    }

    return [
        'peer' => $peer,
        'chain' => array_keys($unique),
        'sources' => $sources,
    ];
}

function hp_geo_lookup(string $ip): array
{
    static $cache = null;
    if ($cache === null) {
        $cache = [];
        if (is_file(HP_GEO_CACHE)) {
            $decoded = json_decode((string) file_get_contents(HP_GEO_CACHE), true);
            if (is_array($decoded)) {
                $cache = $decoded;
            }
        }
    }

    if (isset($cache[$ip]) && is_array($cache[$ip])) {
        return $cache[$ip];
    }

    if (!hp_is_public_ip($ip)) {
        $result = [
            'ip' => $ip,
            'status' => 'private_or_reserved',
            'country' => null, 'regionName' => null, 'city' => null,
            'isp' => null, 'org' => null, 'as' => null,
            'lat' => null, 'lon' => null, 'proxy' => null, 'hosting' => null,
        ];
        $cache[$ip] = $result;
        return $result;
    }

    $url = 'http://ip-api.com/json/' . rawurlencode($ip)
        . '?fields=status,message,country,regionName,city,lat,lon,isp,org,as,proxy,hosting,query';
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 2.5,
            'header' => "User-Agent: OrnamentaHoneypot/1.0\r\n",
        ],
    ]);
    $body = @file_get_contents($url, false, $ctx);
    $data = is_string($body) ? json_decode($body, true) : null;

    if (!is_array($data) || ($data['status'] ?? '') !== 'success') {
        $result = [
            'ip' => $ip,
            'status' => 'lookup_failed',
            'error' => is_array($data) ? ($data['message'] ?? 'unknown') : 'no_response',
        ];
    } else {
        $result = [
            'ip' => $ip,
            'status' => 'success',
            'country' => $data['country'] ?? null,
            'regionName' => $data['regionName'] ?? null,
            'city' => $data['city'] ?? null,
            'lat' => $data['lat'] ?? null,
            'lon' => $data['lon'] ?? null,
            'isp' => $data['isp'] ?? null,
            'org' => $data['org'] ?? null,
            'as' => $data['as'] ?? null,
            'proxy' => $data['proxy'] ?? null,
            'hosting' => $data['hosting'] ?? null,
        ];
    }

    $cache[$ip] = $result;
    @file_put_contents(HP_GEO_CACHE, json_encode($cache, JSON_PRETTY_PRINT), LOCK_EX);
    return $result;
}

function hp_fake_login_page(): void
{
    http_response_code(200);
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Admin Login</title>'
        . '<style>body{font-family:system-ui;background:#0b1220;color:#e8eefc;display:flex;min-height:100vh;align-items:center;justify-content:center}'
        . '.box{background:#121a2b;padding:2rem;border-radius:12px;width:min(360px,92vw);box-shadow:0 10px 40px #0008}'
        . 'input,button{width:100%;margin:.45rem 0;padding:.7rem;border-radius:8px;border:1px solid #334}'
        . 'button{background:#3b82f6;color:#fff;border:0;cursor:pointer}</style></head><body><div class="box">'
        . '<h1 style="margin:0 0 1rem;font-size:1.2rem">Administrator</h1>'
        . '<form method="post"><input name="username" placeholder="Username" autocomplete="off">'
        . '<input name="password" type="password" placeholder="Password" autocomplete="off">'
        . '<button type="submit">Sign in</button></form>'
        . '<p style="opacity:.55;font-size:.8rem;margin:.8rem 0 0">Unauthorized access is monitored.</p>'
        . '</div></body></html>';
}

// ---- main ----
@mkdir(HP_LOG_DIR, 0700, true);
// Ensure secret exists
hp_secret();

$owner = hp_owner_bypassed();
$ipInfo = hp_collect_ip_chain();
$peer = $ipInfo['peer'];
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$uri = $_SERVER['REQUEST_URI'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$geoChain = [];
foreach ($ipInfo['chain'] as $ip) {
    $geoChain[] = [
        'ip' => $ip,
        'claimed_by' => array_values(array_unique($ipInfo['sources'][$ip] ?? [])),
        'is_tcp_peer' => $ip === $peer,
        'is_public' => hp_is_public_ip($ip),
        'geo' => hp_geo_lookup($ip),
    ];
}

$originGuess = null;
foreach ($geoChain as $row) {
    if (!$row['is_public']) {
        continue;
    }
    $claimed = $row['claimed_by'];
    if (in_array('CF-Connecting-IP', $claimed, true) || in_array('True-Client-IP', $claimed, true)) {
        $originGuess = $row;
        break;
    }
}
if ($originGuess === null) {
    foreach ($geoChain as $row) {
        if (!$row['is_tcp_peer'] && $row['is_public'] && in_array('X-Forwarded-For', $row['claimed_by'], true)) {
            $originGuess = $row;
            break;
        }
    }
}
if ($originGuess === null) {
    foreach ($geoChain as $row) {
        if ($row['is_public']) {
            $originGuess = $row;
            break;
        }
    }
}

$blockedIps = [];
if (!$owner) {
    $blockTargets = hp_block_targets($peer ?? '', $ipInfo['sources']);
    foreach ($blockTargets as $ip => $reason) {
        if (hp_is_whitelisted($ip)) {
            continue;
        }
        hp_rebuild_blocklist($ip);
        $blockedIps[$ip] = $reason;
    }
}

$event = [
    'ts' => gmdate('c'),
    'trap' => $uri,
    'method' => $method,
    'tcp_peer' => $peer,
    'behind_cloudflare' => $peer ? hp_is_cloudflare_ip($peer) : false,
    'owner_bypass' => $owner,
    'blocked' => $blockedIps !== [],
    'blocked_ips' => $blockedIps,
    'user_agent' => $ua,
    'host' => $_SERVER['HTTP_HOST'] ?? '',
    'referer' => $_SERVER['HTTP_REFERER'] ?? null,
    'accept_language' => $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? null,
    'post_keys' => $method === 'POST' ? array_keys($_POST) : [],
    'proxy_chain' => $geoChain,
    'origin_guess' => $originGuess,
    'headers_raw' => [
        'x_forwarded_for' => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null,
        'x_real_ip' => $_SERVER['HTTP_X_REAL_IP'] ?? null,
        'cf_connecting_ip' => $_SERVER['HTTP_CF_CONNECTING_IP'] ?? null,
        'true_client_ip' => $_SERVER['HTTP_TRUE_CLIENT_IP'] ?? null,
        'forwarded' => $_SERVER['HTTP_FORWARDED'] ?? null,
        'via' => $_SERVER['HTTP_VIA'] ?? null,
    ],
];

file_put_contents(HP_EVENTS, json_encode($event, JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND | LOCK_EX);

if ($owner) {
    // Don't keep the owner on a fake admin page — send home.
    header('Location: /', true, 302);
    exit;
}

usleep(350000);
hp_fake_login_page();
