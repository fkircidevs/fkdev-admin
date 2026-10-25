<?php
// config.example.php dosyasını config.php olarak kopyala ve değerleri doldur.
// config.php dosyasını asla GitHub'a gönderme (.gitignore içinde).
return [
    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'name' => getenv('DB_NAME') ?: 'fkdev_admin',
        'user' => getenv('DB_USER') ?: 'fkdev_app',
        'pass' => getenv('DB_PASS') ?: '',
    ],
    'app' => [
        'url'          => 'https://admin.ornek.com',
        'session_name' => 'fkadmin',
        'max_attempts' => 5,
        'lock_minutes' => 15,
    ],
];
