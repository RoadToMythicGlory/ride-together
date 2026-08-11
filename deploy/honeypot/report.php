#!/usr/bin/env php
<?php
declare(strict_types=1);
/**
 * CLI report: php ~/honeypot/report.php [n]
 * Shows last N honeypot hits with proxy-chain geolocation.
 */
$cfg = require __DIR__ . '/config.php';
$home = rtrim($cfg['home'], '/');
$file = $home . '/logs/events.jsonl';
$n = isset($argv[1]) ? max(1, (int) $argv[1]) : 20;

if (!is_file($file)) {
    fwrite(STDERR, "No events yet: {$file}\n");
    exit(1);
}

$lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
$lines = array_slice($lines, -$n);

foreach ($lines as $line) {
    $e = json_decode($line, true);
    if (!is_array($e)) {
        continue;
    }
    echo str_repeat('=', 72) . PHP_EOL;
    echo ($e['ts'] ?? '?') . '  ' . ($e['method'] ?? '') . ' ' . ($e['trap'] ?? '') . PHP_EOL;
    echo 'Host: ' . ($e['host'] ?? '') . PHP_EOL;
    echo 'TCP peer: ' . ($e['tcp_peer'] ?? '?')
        . '  cf=' . (!empty($e['behind_cloudflare']) ? 'yes' : 'no')
        . '  blocked=' . (!empty($e['blocked']) ? 'yes' : 'no')
        . '  owner_bypass=' . (!empty($e['owner_bypass']) ? 'yes' : 'no') . PHP_EOL;
    if (!empty($e['blocked_ips']) && is_array($e['blocked_ips'])) {
        foreach ($e['blocked_ips'] as $bip => $why) {
            echo "Blocked IP: {$bip} ({$why})\n";
        }
    }
    if (!empty($e['origin_guess']['ip'])) {
        $g = $e['origin_guess']['geo'] ?? [];
        echo 'Origin guess (via proxy headers): ' . $e['origin_guess']['ip']
            . ' | ' . ($g['city'] ?? '?') . ', ' . ($g['regionName'] ?? '?') . ', ' . ($g['country'] ?? '?')
            . ' | ISP ' . ($g['isp'] ?? '?')
            . ' | proxy=' . json_encode($g['proxy'] ?? null)
            . ' hosting=' . json_encode($g['hosting'] ?? null) . PHP_EOL;
    }
    echo "Proxy chain:\n";
    foreach ($e['proxy_chain'] ?? [] as $hop) {
        $g = $hop['geo'] ?? [];
        $flags = [];
        if (!empty($hop['is_tcp_peer'])) {
            $flags[] = 'TCP';
        }
        if (!empty($hop['is_public'])) {
            $flags[] = 'public';
        }
        echo '  - ' . ($hop['ip'] ?? '?')
            . ' [' . implode(',', $hop['claimed_by'] ?? []) . ']'
            . ' (' . implode(',', $flags) . ')'
            . ' => ' . ($g['city'] ?? '?') . '/' . ($g['country'] ?? '?')
            . ' isp=' . ($g['isp'] ?? '?')
            . ' as=' . ($g['as'] ?? '?')
            . ' proxy=' . json_encode($g['proxy'] ?? null)
            . ' hosting=' . json_encode($g['hosting'] ?? null)
            . PHP_EOL;
    }
    echo 'UA: ' . ($e['user_agent'] ?? '') . PHP_EOL;
}
