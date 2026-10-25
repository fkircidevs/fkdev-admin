<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}
csrf_check();

$email    = mb_strtolower(trim((string) ($_POST['email'] ?? '')));
$password = (string) ($_POST['password'] ?? '');

if (too_many_attempts($email)) {
    redirect_with('/giris/', 'Çok fazla deneme yapıldı. 15 dakika sonra tekrar dene.', 'danger');
}

$stmt = db()->prepare('SELECT id, password_hash FROM users WHERE email = ? AND is_active = 1 LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

$ok = $user && password_verify($password, $user['password_hash']);
log_attempt($email, (bool) $ok);

if (!$ok) {
    usleep(random_int(200000, 400000));
    redirect_with('/giris/', 'E-posta ya da şifre hatalı.', 'danger');
}

if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
    db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        ->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
}

session_regenerate_id(true);
$_SESSION['uid'] = (int) $user['id'];
unset($_SESSION['csrf']);
db()->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);

redirect_with('/', 'Tekrar hoş geldin!');
