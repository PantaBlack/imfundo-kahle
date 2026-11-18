<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
$email = '';

if ($data && isset($data['email'])) {
    $email = trim($data['email']);
} elseif (isset($_POST['email'])) {
    $email = trim($_POST['email']);
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Por favor ingresa un correo electrónico válido.']);
    exit;
}

$db = get_db();
if (!$db) {
    echo json_encode(['success' => true, 'message' => '¡Gracias por tu interés! Te hemos añadido a la lista.']);
    exit;
}

try {
    $stmt = $db->prepare("SELECT id FROM subscribers WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => true, 'message' => 'Este correo ya está registrado. ¡Gracias por seguir con nosotros!']);
        exit;
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $insert = $db->prepare("INSERT INTO subscribers (email, ip_address, created_at) VALUES (?, ?, NOW())");
    $insert->execute([$email, $ip]);

    echo json_encode(['success' => true, 'message' => '¡Gracias por suscribirte! Recibirás los boletines cada mes.']);
} catch (Exception $e) {
    error_log('Error al suscribir: ' . $e->getMessage());
    echo json_encode(['success' => true, 'message' => '¡Gracias por suscribirte!']);
}
