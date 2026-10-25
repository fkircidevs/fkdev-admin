<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}
csrf_check();

$name     = trim((string) ($_POST['name'] ?? ''));
$email    = mb_strtolower(trim((string) ($_POST['email'] ?? '')));
$password = (string) ($_POST['password'] ?? '');
$confirm  = (string) ($_POST['password_confirm'] ?? '');
$terms    = isset($_POST['terms']);

$errors = [];
if (mb_strlen($name) < 2 || mb_strlen($name) > 120) $errors[] = 'Ad 2–120 karakter olmalı.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Geçerli bir e-posta yaz.';
if (mb_strlen($password) < 10) $errors[] = 'Şifre en az 10 karakter olmalı.';
if (!hash_equals($password, $confirm)) $errors[] = 'Şifreler aynı değil.';
if (!$terms) $errors[] = 'Kullanım koşullarını onaylaman gerekiyor.';

if ($errors) {
    redirect_with('/kayit/', implode(' ', $errors), 'danger');
}

try {
    db()->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
        ->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
} catch (PDOException $ex) {
    if ($ex->getCode() === '23000') {
        redirect_with('/kayit/', 'Bu e-posta ile hesap açılamadı. Hesabın varsa giriş yap.', 'danger');
    }
    error_log($ex->getMessage());
    redirect_with('/kayit/', 'Şu an kayıt yapılamıyor, biraz sonra tekrar dene.', 'danger');
}

session_regenerate_id(true);
$_SESSION['uid'] = (int) db()->lastInsertId();
redirect_with('/', 'Hesabın oluşturuldu, hoş geldin!');
