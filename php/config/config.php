<?php
// ========================================================
// Imfundo Kahle - Configuración General
// ========================================================
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('SITE_NAME', 'Imfundo Kahle');
define('SITE_TAGLINE', 'Educación con equidad');

// Detección automática de URL base
$isHttps = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') || 
           (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
define('SITE_URL', ($isHttps ? 'https://' : 'http://') . $host);

define('UPLOAD_DIR', __DIR__ . '/../uploads/receipts/');
define('UPLOAD_URL', '/uploads/receipts/');

// Pasarela de Pagos Culqi
define('CULQI_PUBLIC_KEY', getenv('CULQI_PUBLIC_KEY') ?: 'pk_test_e4f3a743a6d96a75');
define('CULQI_SECRET_KEY', getenv('CULQI_SECRET_KEY') ?: 'sk_test_7f11186cb2a41dc6');

// Notificación de Despacho por WhatsApp (954 920 068)
define('WHATSAPP_PHONE', getenv('WHATSAPP_PHONE') ?: '51954920068');
