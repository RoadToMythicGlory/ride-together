<?php
declare(strict_types=1);

/**
 * Secret-based owner bypass — NOT IP whitelist.
 * Cookie survives dynamic ISP IP changes.
 */

function hp_secret(): string
{
    static $secret = null;
    if (is_string($secret)) {
        return $secret;
    }
    $path = HP_ROOT . '/secret.key';
    if (!is_file($path) || filesize($path) < 16) {
        $generated = bin2hex(random_bytes(32));
        file_put_contents($path, $generated . "\n", LOCK_EX);
        chmod($path, 0600);
        $secret = $generated;
        return $secret;
    }
    $secret = trim((string) file_get_contents($path));
    return $secret;
}

function hp_cookie_name(): string
{
    return 'hp_bypass';
}

function hp_bypass_ttl(): int
{
    return 60 * 60 * 24 * 90; // 90 days
}

function hp_sign(string $payload): string
{
    return hash_hmac('sha256', $payload, hp_secret());
}

function hp_issue_bypass_cookie(): void
{
    $exp = (string) (time() + hp_bypass_ttl());
    $sig = hp_sign($exp);
    $val = $exp . '.' . $sig;
    setcookie(hp_cookie_name(), $val, [
        'expires' => (int) $exp,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    $_COOKIE[hp_cookie_name()] = $val;
}

function hp_has_bypass_cookie(): bool
{
    $raw = $_COOKIE[hp_cookie_name()] ?? '';
    if ($raw === '' || !str_contains($raw, '.')) {
        return false;
    }
    [$exp, $sig] = explode('.', $raw, 2);
    if (!ctype_digit($exp) || (int) $exp < time()) {
        return false;
    }
    $expect = hp_sign($exp);
    return hash_equals($expect, $sig);
}

function hp_provided_secret(): ?string
{
    $k = $_GET['k'] ?? $_POST['k'] ?? null;
    if (is_string($k) && $k !== '') {
        return $k;
    }
    $hdr = $_SERVER['HTTP_X_HP_UNLOCK'] ?? '';
    return is_string($hdr) && $hdr !== '' ? $hdr : null;
}

function hp_secret_ok(?string $provided): bool
{
    if ($provided === null || $provided === '') {
        return false;
    }
    return hash_equals(hp_secret(), $provided);
}

function hp_owner_bypassed(): bool
{
    if (hp_has_bypass_cookie()) {
        return true;
    }
    // Allow one-shot unlock header/query on trap hits without banning
    return hp_secret_ok(hp_provided_secret());
}
