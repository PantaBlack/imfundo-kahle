<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../config/db.php';

$db = get_db();
$products = [];

if ($db) {
    try {
        $stmt = $db->query("SELECT id, code, name, frontend_name, price, old_price, stock, origin, category, image, is_active FROM products WHERE is_active = 1 ORDER BY id ASC");
        $products = $stmt->fetchAll();
    } catch (Exception $e) {
        error_log('Error al consultar productos: ' . $e->getMessage());
    }
}

if (empty($products)) {
    $fallbackFile = __DIR__ . '/products_fallback.json';
    if (file_exists($fallbackFile)) {
        $products = json_decode(file_get_contents($fallbackFile), true) ?: [];
    }
}

echo json_encode([
    'success'  => true,
    'count'    => count($products),
    'products' => $products
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
