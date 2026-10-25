<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';

require_login(['admin', 'editor']);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$columns = [
    0 => 'o.code',
    1 => 'c.name',
    2 => 'o.created_at',
    3 => 'c.city',
    4 => 'o.total',
    5 => 'o.status',
];

$draw   = (int) ($_GET['draw'] ?? 0);
$start  = max(0, (int) ($_GET['start'] ?? 0));
$length = (int) ($_GET['length'] ?? 10);
$length = $length < 1 || $length > 100 ? 10 : $length;
$search = trim((string) ($_GET['search']['value'] ?? ''));

$orderCol = (int) ($_GET['order'][0]['column'] ?? 2);
$orderDir = strtolower((string) ($_GET['order'][0]['dir'] ?? 'desc')) === 'asc' ? 'ASC' : 'DESC';
$orderBy  = $columns[$orderCol] ?? 'o.created_at';

$from   = ' FROM orders o JOIN customers c ON c.id = o.customer_id ';
$where  = '';
$params = [];

if ($search !== '') {
    $where = ' WHERE (o.code LIKE :q1 OR c.name LIKE :q2 OR c.city LIKE :q3 OR o.status LIKE :q4) ';
    $like = '%' . addcslashes($search, '%_\\') . '%';
    foreach ([':q1', ':q2', ':q3', ':q4'] as $k) {
        $params[$k] = $like;
    }
}

$status = (string) ($_GET['columns'][5]['search']['value'] ?? '');
$allowed = ['Bekliyor', 'Hazırlanıyor', 'Kargoda', 'Teslim edildi', 'İade'];
$status = trim($status, '^$');
if (in_array($status, $allowed, true)) {
    $where .= ($where ? ' AND ' : ' WHERE ') . ' o.status = :status ';
    $params[':status'] = $status;
}

$total = (int) db()->query('SELECT COUNT(*) FROM orders')->fetchColumn();

$stmt = db()->prepare('SELECT COUNT(*)' . $from . $where);
$stmt->execute($params);
$filtered = (int) $stmt->fetchColumn();

$sql = 'SELECT o.code, c.name, o.created_at, c.city, o.total, o.status'
     . $from . $where
     . " ORDER BY $orderBy $orderDir LIMIT :start, :length";
$stmt = db()->prepare($sql);
foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->bindValue(':start', $start, PDO::PARAM_INT);
$stmt->bindValue(':length', $length, PDO::PARAM_INT);
$stmt->execute();

$data = [];
foreach ($stmt as $row) {
    $data[] = [
        e($row['code']),
        e($row['name']),
        e(date('d.m.Y H:i', strtotime($row['created_at']))),
        e($row['city']),
        number_format((float) $row['total'], 2, ',', '.') . ' ₺',
        e($row['status']),
    ];
}

echo json_encode([
    'draw'            => $draw,
    'recordsTotal'    => $total,
    'recordsFiltered' => $filtered,
    'data'            => $data,
], JSON_UNESCAPED_UNICODE);
