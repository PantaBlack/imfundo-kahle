<?php
// ========================================================
// Imfundo Kahle - Conexión MySQL (PDO)
// Compatible con wePanel / cPanel / Localhost
// ========================================================
require_once __DIR__ . '/config.php';

// EDITAR ESTOS VALORES CON TUS CREDENCIALES DE WEPANEL
// (En wePanel crea la base de datos y usuario en la sección "Bases de datos MySQL")
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'imfundo_kahle');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_CHARSET', 'utf8mb4');

function get_db() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('[DB Error] No se pudo conectar a MySQL: ' . $e->getMessage());
            return null;
        }
    }
    return $pdo;
}
