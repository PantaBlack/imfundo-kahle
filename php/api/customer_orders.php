<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../config/db.php';

if (empty($_SESSION['customer_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión para consultar tus pedidos.']);
    exit;
}

$db = get_db();
if (!$db) {
    echo json_encode(['success' => true, 'orders' => []]);
    exit;
}

try {
    $customerId = (int)$_SESSION['customer_id'];
    $customerEmail = $_SESSION['customer_email'] ?? '';
    
    $stmt = $db->prepare("
        SELECT id, order_code, customer_name, customer_email, customer_phone, customer_address, 
               payment_method, subtotal, shipping, total, status, operation_number, receipt_file, 
               notes, created_at 
        FROM orders 
        WHERE customer_id = ? OR (customer_email = ? AND (customer_id IS NULL OR customer_id = 0))
        ORDER BY created_at DESC
    ");
    $stmt->execute([$customerId, $customerEmail]);
    $orders = $stmt->fetchAll();
    
    $itemStmt = $db->prepare("SELECT product_code, product_name, price, quantity, subtotal FROM order_items WHERE order_id = ?");
    foreach ($orders as &$order) {
        $itemStmt->execute([$order['id']]);
        $order['items'] = $itemStmt->fetchAll();
    }
    
    echo json_encode(['success' => true, 'orders' => $orders]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al consultar pedidos: ' . $e->getMessage()]);
}
