<?php
declare(strict_types=1);

// Canonical honeypot home (outside public web roots)
return [
    'home' => getenv('HONEYPOT_HOME') ?: '/home/lancjvis/honeypot',
];
