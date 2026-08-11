<?php
declare(strict_types=1);

$__hp_cfg = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];
if (!defined('HP_ROOT')) {
    define('HP_ROOT', rtrim((string) ($__hp_cfg['home'] ?? __DIR__), '/'));
}
if (!defined('HP_LOG_DIR')) {
    define('HP_LOG_DIR', HP_ROOT . '/logs');
}
if (!defined('HP_BLOCKLIST')) {
    define('HP_BLOCKLIST', HP_ROOT . '/blocklist.htaccess');
}
if (!defined('HP_EVENTS')) {
    define('HP_EVENTS', HP_LOG_DIR . '/events.jsonl');
}
if (!defined('HP_WHITELIST')) {
    define('HP_WHITELIST', HP_ROOT . '/whitelist.txt');
}
if (!defined('HP_GEO_CACHE')) {
    define('HP_GEO_CACHE', HP_LOG_DIR . '/geo-cache.json');
}
if (!defined('HP_MAX_BLOCKS')) {
    define('HP_MAX_BLOCKS', 5000);
}

require_once HP_ROOT . '/blocklist.php';
