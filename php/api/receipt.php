<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$orderCode = $_GET['code'] ?? $_POST['orderCode'] ?? '';
$operationNumber = trim($_POST['operationNumber'] ?? '');

if (empty($orderCode)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Código de pedido no especificado.']);
    exit;
}

if (!isset($_FILES['receipt']) || $_FILES['receipt']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No se adjuntó ningún archivo de comprobante válido.']);
    exit;
}

$file = $_FILES['receipt'];
$maxSize = 8 * 1024 * 1024; // 8MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El comprobante no debe superar los 8 MB.']);
    exit;
}

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Formato no permitido. Solo se aceptan imágenes (JPG, PNG, WebP) o PDF.']);
    exit;
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$safeExt = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $ext));
if ($safeExt === 'jpeg') $safeExt = 'jpg';

$destDir = __DIR__ . '/../uploads/receipts/';
if (!is_dir($destDir)) {
    mkdir($destDir, 0755, true);
}

$cleanOrder = preg_replace('/[^a-zA-Z0-9_-]/', '', $orderCode);
$fileName = 'comprobante_' . $cleanOrder . '_' . time() . '.' . $safeExt;
$destPath = $destDir . $fileName;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al guardar el archivo en el servidor.']);
    exit;
}

$receiptUrl = '/uploads/receipts/' . $fileName;

$db = get_db();
if ($db) {
    try {
        $stmt = $db->prepare("UPDATE orders SET receipt_file = ?, operation_number = ?, status = 'pending' WHERE order_code = ?");
        $stmt->execute([$receiptUrl, $operationNumber, $orderCode]);
    } catch (Exception $e) {
        error_log('Error actualizando comprobante: ' . $e->getMessage());
    }
}

echo json_encode([
    'success' => true,
    'message' => 'Comprobante recibido con éxito. Verificaremos tu pedido a la brevedad.',
    'receiptUrl' => $receiptUrl
]);
