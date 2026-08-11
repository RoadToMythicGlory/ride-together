#!/bin/bash
# Install honeypot traps. Does NOT modify SSH / authorized_keys.
# Owner auth = secret.key cookie unlock (not dynamic ISP IP whitelist).
set -euo pipefail

HP_HOME="${HOME}/honeypot"
PATHS_FILE="${HP_HOME}/trap-paths.txt"
WEBROOTS_FILE="${HP_HOME}/webroots.txt"

mkdir -p "${HP_HOME}/logs"
chmod 700 "${HP_HOME}" "${HP_HOME}/logs"
chmod 644 "${HP_HOME}/catch.php" "${HP_HOME}/config.php" "${HP_HOME}/stub.php" \
  "${HP_HOME}/stub-unlock.php" "${HP_HOME}/auth.php" "${HP_HOME}/bootstrap.php" \
  "${HP_HOME}/blocklist.php" "${HP_HOME}/unlock.php" "${PATHS_FILE}" 2>/dev/null || true
chmod 600 "${HP_HOME}/whitelist.txt" 2>/dev/null || true
chmod 700 "${HP_HOME}/report.php"
chmod +x "${HP_HOME}/report.php" "${HP_HOME}/install.sh" 2>/dev/null || true

# Generate secret if missing
php -r 'require "'"${HP_HOME}"'/bootstrap.php"; require HP_ROOT."/auth.php"; echo hp_secret(), PHP_EOL;' >/dev/null
chmod 600 "${HP_HOME}/secret.key"

# Strip any public IPs from whitelist (keep only comments/private)
php <<'PHP'
<?php
$path = getenv('HOME') . '/honeypot/whitelist.txt';
$keep = [];
foreach (file($path, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
    $t = trim($line);
    if ($t === '' || str_starts_with($t, '#')) { $keep[] = $line; continue; }
    if (in_array($t, ['127.0.0.1', '::1'], true)) { $keep[] = $line; continue; }
    if (str_contains($t, '/')) { $keep[] = $line; continue; }
    if (filter_var($t, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        // drop public IP
        continue;
    }
    $keep[] = $line;
}
file_put_contents($path, implode("\n", $keep) . "\n");
PHP

if [[ ! -f "${WEBROOTS_FILE}" ]]; then
  cat > "${WEBROOTS_FILE}" <<EOF
${HOME}/public_html
${HOME}/ornamenta.lanceloterp.io
EOF
fi

if [[ ! -f "${HP_HOME}/blocklist.htaccess" ]]; then
  cat > "${HP_HOME}/blocklist.htaccess" <<'EOF'
# HONEYPOT AUTO-GENERATED — do not edit by hand
# Count: 0
<IfModule mod_rewrite.c>
RewriteEngine On
# no blocked IPs yet
</IfModule>
EOF
fi

php <<'PHP'
<?php
$home = getenv('HOME') . '/honeypot';
$paths = file($home . '/trap-paths.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
$roots = file($home . '/webroots.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
$block = file_get_contents($home . '/blocklist.htaccess') ?: '';

foreach ($roots as $root) {
    $root = trim($root);
    if ($root === '' || str_starts_with($root, '#') || !is_dir($root)) {
        echo "skip: {$root}\n";
        continue;
    }

    $inc = $root . '/hp-trap';
    if (!is_dir($inc)) {
        mkdir($inc, 0755, true);
    }
    copy($home . '/stub.php', $inc . '/catch.php');
    copy($home . '/stub-unlock.php', $inc . '/unlock.php');
    file_put_contents($inc . '/.htaccess', <<<'HT'
<FilesMatch "^(catch|unlock)\.php$">
  <IfModule mod_authz_core.c>
    Require all granted
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Allow from all
  </IfModule>
</FilesMatch>
HT);

    $trapRules = ["# BEGIN HONEYPOT-TRAPS", "<IfModule mod_rewrite.c>", "RewriteEngine On", "RewriteBase /"];
    foreach ($paths as $p) {
        $p = trim($p);
        if ($p === '' || str_starts_with($p, '#')) {
            continue;
        }
        $esc = preg_quote($p, '/');
        $trapRules[] = "RewriteRule ^{$esc}/?$ /hp-trap/catch.php [L,QSA]";
    }
    $trapRules[] = "</IfModule>";
    $trapRules[] = "# END HONEYPOT-TRAPS";
    $trapSection = implode("\n", $trapRules);

    $denySection = "# BEGIN HONEYPOT-DENY\n{$block}\n# END HONEYPOT-DENY";

    $ht = $root . '/.htaccess';
    $current = is_file($ht) ? file_get_contents($ht) : '';
    $current = preg_replace('/# BEGIN HONEYPOT-TRAPS.*?# END HONEYPOT-TRAPS\n?/s', '', $current) ?? $current;
    $current = preg_replace('/# BEGIN HONEYPOT-DENY.*?# END HONEYPOT-DENY\n?/s', '', $current) ?? $current;
    $current = ltrim((string) $current);

    file_put_contents($ht, $denySection . "\n\n" . $trapSection . "\n\n" . $current);
    copy($home . '/blocklist.htaccess', $root . '/.honeypot-deny.htaccess');
    echo "installed traps in {$root}\n";
}
PHP

SECRET=$(tr -d '\n' < "${HP_HOME}/secret.key")
echo "OK honeypot at ${HP_HOME}"
echo "OWNER UNLOCK (bookmark this — works even if banned, IP can change):"
echo "  https://ornamenta.lanceloterp.io/hp-trap/unlock.php?k=${SECRET}"
echo "Secret file: ${HP_HOME}/secret.key (chmod 600)"
echo "Report: php ${HP_HOME}/report.php 20"
