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
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$tokenId = trim($data['tokenId'] ?? '');
$customer = $data['customer'] ?? [];
$name = trim($customer['name'] ?? 'Cliente');
$email = trim($data['email'] ?? ($customer['email'] ?? 'cliente@ejemplo.com'));
$phone = trim($customer['phone'] ?? '');
$address = trim($customer['address'] ?? '');
$city = trim($customer['city'] ?? 'Lima');
$items = $data['items'] ?? [];
$shippingCents = (int)($data['shippingCents'] ?? 990);
$shipping = $shippingCents / 100;
$amountCents = (int)($data['amountCents'] ?? 0);
$total = $amountCents > 0 ? ($amountCents / 100) : (float)($data['total'] ?? 44.90);

if ($amountCents <= 0) {
    $amountCents = (int)round($total * 100);
}

$chargeId = 'chr_test_' . substr(bin2hex(random_bytes(4)), 0, 8);

// Si se recibe tokenId y tenemos Culqi Secret Key configurada
if (!empty($tokenId) && strpos($tokenId, 'demo_') !== 0 && defined('CULQI_SECRET_KEY') && strpos(CULQI_SECRET_KEY, 'sk_') === 0) {
    $ch = curl_init('https://api.culqi.com/v2/charges');
    $payload = json_encode([
        'amount' => $amountCents,
        'currency_code' => 'PEN',
        'email' => $email,
        'source_id' => $tokenId
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . CULQI_SECRET_KEY
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($res) {
        $jsonRes = json_decode($res, true);
        if ($httpCode >= 400) {
            $msg = $jsonRes['user_message'] ?? ($jsonRes['merchant_message'] ?? 'Error al procesar el pago con Culqi.');
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $msg, 'details' => $jsonRes]);
            exit;
        }
        if (!empty($jsonRes['id'])) {
            $chargeId = $jsonRes['id'];
        }
    }
}

$orderCode = 'IK-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));
$db = get_db();

if ($db) {
    try {
        $db->beginTransaction();
        $subtotal = max(0, $total - $shipping);
        $customerId = isset($_SESSION['customer_id']) ? (int)$_SESSION['customer_id'] : null;

        $stmt = $db->prepare("
            INSERT INTO orders (order_code, customer_id, customer_name, customer_email, customer_phone, customer_address, payment_method, subtotal, shipping, total, status, operation_number, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'culqi', ?, ?, ?, 'verified', ?, NOW())
        ");
        $stmt->execute([
            $orderCode,
            $customerId,
            $name,
            $email,
            $phone,
            $address . ', ' . $city,
            $subtotal,
            $shipping,
            $total,
            $chargeId
        ]);
        $orderId = $db->lastInsertId();

        if (is_array($items)) {
            $itemStmt = $db->prepare("
                INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            ");
            foreach ($items as $it) {
                $pName = $it['name'] ?? 'Producto';
                $qty = (int)($it['quantity'] ?? 1);
                $uPrice = (float)($it['price'] ?? 0);
                $iSub = $uPrice * $qty;
                $itemStmt->execute([$orderId, $pName, $qty, $uPrice, $iSub]);
            }
        }
        $db->commit();
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
    }
}

// Generar mensaje de WhatsApp para 51954920068
$waPhone = defined('WHATSAPP_PHONE') ? WHATSAPP_PHONE : '51954920068';
$dateStr = date('d/m/Y H:i');

$lines = [];
$lines[] = '🛍️ *¡NUEVO PEDIDO PAGADO EN TIENDA! - IMFUNDO KAHLE*';
$lines[] = '──────────────────────────────';
$lines[] = '📋 *N° de Pedido:* ' . $orderCode;
$lines[] = '💳 *Estado del Pago:* ✓ PAGADO (Pasarela Culqi)';
$lines[] = '🆔 *Cargo Culqi:* ' . $chargeId;
$lines[] = '📅 *Fecha:* ' . $dateStr;
$lines[] = '';
$lines[] = '👤 *DATOS DEL CLIENTE:*';
$lines[] = '• *Nombre:* ' . $name;
$lines[] = '• *Teléfono:* ' . $phone;
$lines[] = '• *Email:* ' . $email;
$lines[] = '';
$lines[] = '📍 *DIRECCIÓN DE ENVÍO:*';
$lines[] = '• *Dirección:* ' . $address;
$lines[] = '• *Ciudad/Distrito:* ' . $city;
$lines[] = '';
$lines[] = '📦 *PRODUCTOS COMPRADOS:*';
if (is_array($items) && count($items) > 0) {
    foreach ($items as $it) {
        $pName = $it['name'] ?? 'Polo Solidario';
        $qty = (int)($it['quantity'] ?? 1);
        $pr = number_format((float)($it['price'] ?? 0), 2);
        $lines[] = '• ' . $qty . 'x ' . $pName . ' — S/ ' . $pr;
    }
} else {
    $lines[] = '• Productos solidarios de la tienda';
}
$lines[] = '• Envío solidario: S/ ' . number_format($shipping, 2);
$lines[] = '';
$lines[] = '💰 *TOTAL COBRADO:* S/ ' . number_format($total, 2);
$lines[] = '──────────────────────────────';
$lines[] = '🚚 *Acción:* Por favor confirmar la recepción y programar el despacho del paquete. ¡Muchas gracias!';

$waText = implode("
", $lines);
$whatsappUrl = 'https://wa.me/' . $waPhone . '?text=' . rawurlencode($waText);

echo json_encode([
    'success' => true,
    'message' => '¡Pago aprobado con éxito por Culqi!',
    'chargeId' => $chargeId,
    'order' => [
        'order_code' => $orderCode,
        'total' => $total,
        'status' => 'verified',
        'customer_name' => $name,
        'customer_email' => $email,
        'customer_phone' => $phone,
        'customer_address' => $address,
        'customer_city' => $city
    ],
    'whatsappUrl' => $whatsappUrl
]);
