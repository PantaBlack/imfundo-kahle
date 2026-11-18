<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos JSON inválidos.']);
    exit;
}

$customer = $data['customer'] ?? [];
$name    = trim($customer['name'] ?? '');
$email   = trim($customer['email'] ?? '');
$phone   = trim($customer['phone'] ?? '');
$address = trim($customer['address'] ?? '');
$method  = trim($data['paymentMethod'] ?? 'transfer');
$shippingCents = (int)($data['shippingCents'] ?? 0);
$shipping = $shippingCents / 100;

if (empty($name) || empty($phone) || empty($address)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Por favor completa nombre, teléfono y dirección de entrega.']);
    exit;
}

$items = $data['items'] ?? [];
if (empty($items)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El carrito está vacío.']);
    exit;
}

$orderCode = 'IK-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));

$db = get_db();
if (!$db) {
    echo json_encode([
        'success' => true,
        'id'      => $orderCode,
        'order'   => [
            'id' => $orderCode,
            'customer' => $customer,
            'items' => $items,
            'paymentMethod' => $method,
            'shipping' => $shipping,
            'status' => 'pending'
        ]
    ]);
    exit;
}

try {
    $db->beginTransaction();

    $subtotal = 0;
    $itemRows = [];

    foreach ($items as $item) {
        $code = trim($item['code'] ?? '');
        $qty = max(1, (int)($item['quantity'] ?? 1));

        $pStmt = $db->prepare("SELECT name, price FROM products WHERE code = ? OR frontend_name = ? LIMIT 1");
        $pStmt->execute([$code, $code]);
        $prod = $pStmt->fetch();

        $prodName = $prod ? $prod['name'] : $code;
        $prodPrice = $prod ? (float)$prod['price'] : 35.00;
        $lineTotal = $prodPrice * $qty;
        $subtotal += $lineTotal;

        $itemRows[] = [
            'code'  => $code,
            'name'  => $prodName,
            'price' => $prodPrice,
            'qty'   => $qty,
            'total' => $lineTotal
        ];
    }

    $total = $subtotal + $shipping;

    // Si el cliente está autenticado en la sesión, capturamos su customer_id
    $customerId = !empty($_SESSION['customer_id']) ? (int)$_SESSION['customer_id'] : null;
    if (!$customerId && !empty($email)) {
        try {
            $cStmt = $db->prepare("SELECT id FROM customers WHERE LOWER(email) = ? LIMIT 1");
            $cStmt->execute([strtolower($email)]);
            $cRow = $cStmt->fetch();
            if ($cRow) $customerId = (int)$cRow['id'];
        } catch (Exception $e) {}
    }

    $stmt = $db->prepare("
        INSERT INTO orders (order_code, customer_id, customer_name, customer_email, customer_phone, customer_address, payment_method, subtotal, shipping, total, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ");
    $stmt->execute([
        $orderCode, $customerId, $name, $email, $phone, $address, $method, $subtotal, $shipping, $total
    ]);
    $orderId = $db->lastInsertId();

    $itemStmt = $db->prepare("
        INSERT INTO order_items (order_id, product_code, product_name, price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    foreach ($itemRows as $row) {
        $itemStmt->execute([
            $orderId, $row['code'], $row['name'], $row['price'], $row['qty'], $row['total']
        ]);
    }

    $db->commit();

    echo json_encode([
        'success' => true,
        'id'      => $orderCode,
        'order'   => [
            'id' => $orderCode,
            'customer' => $customer,
            'items' => $itemRows,
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'total' => $total,
            'paymentMethod' => $method,
            'status' => 'pending'
        ]
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log('Error creando orden: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al guardar el pedido en el servidor.']);
}
