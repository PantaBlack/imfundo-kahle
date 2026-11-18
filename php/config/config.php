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
