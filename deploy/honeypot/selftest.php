<?php
declare(strict_types=1);
$_SERVER['REMOTE_ADDR'] = '198.51.100.77';
$_SERVER['REQUEST_URI'] = '/wp-login.php';
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_HOST'] = 'ornamenta.lanceloterp.io';
$_SERVER['HTTP_X_FORWARDED_FOR'] = '203.0.113.9, 198.51.100.77';
$_SERVER['HTTP_USER_AGENT'] = 'EvilScanner/9.9';
ob_start();
include __DIR__ . '/catch.php';
ob_end_clean();
echo "selftest_done\n";
