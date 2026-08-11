<?php
declare(strict_types=1);

/**
 * Owner unlock — works even if your IP was banned.
 * Visit: https://YOUR-HOST/hp-trap/unlock.php?k=YOUR_SECRET
 * Does not use IP whitelist. Sets a signed cookie valid ~90 days.
 */

require __DIR__ . '/bootstrap.php';
require HP_ROOT . '/auth.php';

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

$provided = hp_provided_secret();
$ok = hp_secret_ok($provided);

$removed = [];
if ($ok) {
    hp_issue_bypass_cookie();

    $peer = hp_normalize_ip($_SERVER['REMOTE_ADDR'] ?? '') ?? '';
    $cf = hp_normalize_ip($_SERVER['HTTP_CF_CONNECTING_IP'] ?? '') ?? '';
    $true = hp_normalize_ip($_SERVER['HTTP_TRUE_CLIENT_IP'] ?? '') ?? '';

    foreach (array_filter([$peer, $cf, $true]) as $ip) {
        if (hp_remove_from_blocklist($ip)) {
            $removed[] = $ip;
        }
    }

    // Refresh deny markers in webroots
    hp_sync_blocklist_to_roots();

    file_put_contents(
        HP_EVENTS,
        json_encode([
            'ts' => gmdate('c'),
            'event' => 'owner_unlock',
            'tcp_peer' => $peer,
            'removed' => $removed,
            'host' => $_SERVER['HTTP_HOST'] ?? '',
        ], JSON_UNESCAPED_SLASHES) . "\n",
        FILE_APPEND | LOCK_EX
    );
}

$host = htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'site', ENT_QUOTES);
$removedHtml = $removed ? htmlspecialchars(implode(', ', $removed), ENT_QUOTES) : 'none (not on blocklist)';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Honeypot Unlock</title>
  <style>
    body{font-family:system-ui;background:#0b1220;color:#e8eefc;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
    .box{background:#121a2b;padding:1.6rem 1.8rem;border-radius:12px;width:min(440px,92vw)}
    .ok{color:#4ade80}.bad{color:#f87171}
    code{background:#0b1220;padding:.15rem .35rem;border-radius:6px}
    a{color:#93c5fd}
  </style>
</head>
<body>
  <div class="box">
    <?php if ($ok): ?>
      <h1 class="ok" style="margin:0 0 .6rem;font-size:1.15rem">Unlocked</h1>
      <p>Bypass cookie set for ~90 days. Your IP can change — you’re still trusted via the cookie.</p>
      <p>Removed from blocklist: <code><?= $removedHtml ?></code></p>
      <p><a href="/">Go to <?= $host ?></a></p>
    <?php else: ?>
      <h1 class="bad" style="margin:0 0 .6rem;font-size:1.15rem">Invalid key</h1>
      <p>Use your secret unlock URL from the server file <code>~/honeypot/secret.key</code>.</p>
      <form method="get">
        <p><input name="k" placeholder="paste secret" style="width:100%;padding:.65rem;border-radius:8px;border:1px solid #334;background:#0b1220;color:#e8eefc"></p>
        <button type="submit" style="padding:.65rem 1rem;border:0;border-radius:8px;background:#3b82f6;color:#fff">Unlock</button>
      </form>
    <?php endif; ?>
  </div>
</body>
</html>
