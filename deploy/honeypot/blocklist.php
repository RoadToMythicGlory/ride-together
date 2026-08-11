<?php
declare(strict_types=1);

function hp_read_lines(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    return $lines === false ? [] : array_values(array_filter(array_map('trim', $lines), static fn($l) => $l !== '' && $l[0] !== '#'));
}

function hp_normalize_ip(string $ip): ?string
{
    $ip = trim($ip, " \t\"'[]");
    if ($ip === '' || strcasecmp($ip, 'unknown') === 0) {
        return null;
    }
    if (preg_match('/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/', $ip, $m)) {
        $ip = $m[1];
    }
    if (!filter_var($ip, FILTER_VALIDATE_IP)) {
        return null;
    }
    return $ip;
}

function hp_is_public_ip(string $ip): bool
{
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_IPV6)) {
        return false;
    }
    return (bool) filter_var(
        $ip,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    );
}

function hp_is_whitelisted(string $ip): bool
{
    // Only private/loopback safety nets — NOT your dynamic home IP.
    $list = hp_read_lines(HP_WHITELIST);
    foreach ($list as $entry) {
        if ($entry === $ip) {
            return true;
        }
        if (str_contains($entry, '/') && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            [$subnet, $mask] = explode('/', $entry, 2);
            if (filter_var($subnet, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && ctype_digit($mask)) {
                $mask = (int) $mask;
                if ($mask < 0 || $mask > 32) {
                    continue;
                }
                $ipLong = ip2long($ip);
                $subLong = ip2long($subnet);
                $maskLong = $mask === 0 ? 0 : (-1 << (32 - $mask));
                if (($ipLong & $maskLong) === ($subLong & $maskLong)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function hp_load_blocked_ips(): array
{
    $existing = [];
    if (!is_file(HP_BLOCKLIST)) {
        return $existing;
    }
    if (preg_match_all('/RewriteCond %\{REMOTE_ADDR\} \^(.+)\$/m', (string) file_get_contents(HP_BLOCKLIST), $m)) {
        foreach ($m[1] as $escaped) {
            $ip = str_replace('\\', '', $escaped);
            $existing[$ip] = true;
        }
    }
    return $existing;
}

function hp_write_blocklist(array $ips): void
{
    $ips = array_values(array_unique(array_filter($ips, static function ($ip) {
        return is_string($ip) && $ip !== '' && !hp_is_whitelisted($ip);
    })));
    if (count($ips) > HP_MAX_BLOCKS) {
        $ips = array_slice($ips, -HP_MAX_BLOCKS);
    }

    if (!$ips) {
        $body = "# HONEYPOT AUTO-GENERATED — do not edit by hand\n"
            . "# Updated: " . gmdate('c') . "\n"
            . "# Count: 0\n"
            . "<IfModule mod_rewrite.c>\n"
            . "RewriteEngine On\n"
            . "# no blocked IPs yet\n"
            . "</IfModule>\n";
    } else {
        $conds = [];
        foreach ($ips as $ip) {
            $conds[] = 'RewriteCond %{REMOTE_ADDR} ^' . preg_quote($ip, '/') . '$ [OR]';
        }
        $last = array_key_last($conds);
        $conds[$last] = preg_replace('/ \[OR\]$/', '', $conds[$last]) ?? $conds[$last];

        // Unlock endpoint must remain reachable after a ban (dynamic IP / accidental trip)
        $body = "# HONEYPOT AUTO-GENERATED — do not edit by hand\n"
            . "# Updated: " . gmdate('c') . "\n"
            . "# Count: " . count($ips) . "\n"
            . "<IfModule mod_rewrite.c>\n"
            . "RewriteEngine On\n"
            . "RewriteCond %{REQUEST_URI} !^/hp-trap/unlock\\.php [NC]\n"
            . implode("\n", $conds) . "\n"
            . "RewriteRule ^ - [F,L]\n"
            . "</IfModule>\n";
    }

    $tmp = HP_BLOCKLIST . '.tmp';
    file_put_contents($tmp, $body, LOCK_EX);
    rename($tmp, HP_BLOCKLIST);
    hp_sync_blocklist_to_roots();
}

function hp_rebuild_blocklist(string $newIp): void
{
    if (hp_is_whitelisted($newIp)) {
        return;
    }
    $existing = hp_load_blocked_ips();
    $existing[$newIp] = true;
    hp_write_blocklist(array_keys($existing));
}

function hp_remove_from_blocklist(string $ip): bool
{
    $existing = hp_load_blocked_ips();
    if (!isset($existing[$ip])) {
        return false;
    }
    unset($existing[$ip]);
    hp_write_blocklist(array_keys($existing));
    return true;
}

function hp_ensure_htaccess_deny_section(string $root): void
{
    $ht = rtrim($root, '/') . '/.htaccess';
    $markerBegin = '# BEGIN HONEYPOT-DENY';
    $markerEnd = '# END HONEYPOT-DENY';
    $block = is_file(HP_BLOCKLIST) ? (string) file_get_contents(HP_BLOCKLIST) : '';
    $section = $markerBegin . "\n" . $block . $markerEnd . "\n";

    $current = is_file($ht) ? (string) file_get_contents($ht) : '';
    if (str_contains($current, $markerBegin) && str_contains($current, $markerEnd)) {
        $updated = preg_replace(
            '/' . preg_quote($markerBegin, '/') . '.*?' . preg_quote($markerEnd, '/') . '\n?/s',
            $section,
            $current
        );
        if (is_string($updated)) {
            file_put_contents($ht, $updated, LOCK_EX);
        }
    } else {
        file_put_contents($ht, $section . "\n" . $current, LOCK_EX);
    }
}

function hp_sync_blocklist_to_roots(): void
{
    $rootsFile = HP_ROOT . '/webroots.txt';
    foreach (hp_read_lines($rootsFile) as $root) {
        if (!is_dir($root)) {
            continue;
        }
        @copy(HP_BLOCKLIST, rtrim($root, '/') . '/.honeypot-deny.htaccess');
        hp_ensure_htaccess_deny_section($root);
    }
}
