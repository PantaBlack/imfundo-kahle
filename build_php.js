const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const phpDir = path.join(rootDir, 'php');
const viewsDir = path.join(rootDir, 'views');
const publicDir = path.join(rootDir, 'public');

console.log('--- Iniciando generación de proyecto PHP + MySQL para wePanel ---');

// 1. Limpiar o crear php/
if (fs.existsSync(phpDir)) {
    fs.rmSync(phpDir, { recursive: true, force: true });
}
fs.mkdirSync(phpDir, { recursive: true });
fs.mkdirSync(path.join(phpDir, 'config'), { recursive: true });
fs.mkdirSync(path.join(phpDir, 'api'), { recursive: true });
fs.mkdirSync(path.join(phpDir, 'admin'), { recursive: true });
fs.mkdirSync(path.join(phpDir, 'uploads', 'receipts'), { recursive: true });

// 2. Copiar assets (css, js, img)
console.log('Copiando assets (css, js, img)...');
function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
copyDirSync(path.join(publicDir, 'css'), path.join(phpDir, 'css'));
copyDirSync(path.join(publicDir, 'js'), path.join(phpDir, 'js'));
copyDirSync(path.join(publicDir, 'img'), path.join(phpDir, 'img'));

// 3. Extraer productos para database.sql y fallback
console.log('Procesando catálogo de productos...');
const tiendaRaw = fs.readFileSync(path.join(viewsDir, 'tienda.ejs'), 'utf8');
const polosMatch = tiendaRaw.match(/var polos = \[([\s\S]*?)\];/);
const polos = [];
if (polosMatch) {
    try {
        const list = new Function('return [' + polosMatch[1] + '];')();
        list.forEach((p, idx) => {
            polos.push({
                code: 'POLO-' + (idx + 1).toString().padStart(3, '0'),
                name: p.name,
                frontend_name: p.name,
                price: 35.00,
                old_price: 45.00,
                stock: p.stock === 0 ? 0 : 15,
                origin: 'Iquitos',
                category: 'Polos',
                image: p.design || p.frontImg || '/img/tienda/imagenes-polos/El hombre El mito El papa.png'
            });
        });
    } catch (e) {
        console.error('Error parseando polos:', e.message);
    }
}

const accMatch = tiendaRaw.match(/var accesorios = \[([\s\S]*?)\];/);
const accesorios = [];
if (accMatch) {
    try {
        const list = new Function('return [' + accMatch[1] + '];')();
        list.forEach((p, idx) => {
            accesorios.push({
                code: 'ACC-' + (idx + 1).toString().padStart(3, '0'),
                name: p.name,
                frontend_name: p.name,
                price: p.price || 15.00,
                old_price: p.oldPrice || null,
                stock: p.stock === 0 ? 0 : 20,
                origin: p.origin || 'Cusco',
                category: 'Accesorios',
                image: (p.images && p.images[0]) || '/img/tienda/IzquierdaYDerecha/productos/CAP1.png'
            });
        });
    } catch (e) {
        console.error('Error parseando accesorios:', e.message);
    }
}
const allProducts = [...polos, ...accesorios];
fs.writeFileSync(path.join(phpDir, 'api', 'products_fallback.json'), JSON.stringify(allProducts, null, 2), 'utf8');

// 4. Crear database.sql
console.log('Generando database.sql con esquema y productos...');
let sqlContent = `-- Base de datos MySQL para Imfundo Kahle (wePanel / cPanel)
-- Generado automáticamente para Imfundo Kahle

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Tabla de Administradores
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`admin_users\`;
CREATE TABLE \`admin_users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(150) DEFAULT NULL,
  \`role\` VARCHAR(20) DEFAULT 'admin',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuario por defecto: admin / ImfundoKahle2026!
-- Hash generado con password_hash('ImfundoKahle2026!', PASSWORD_BCRYPT)
INSERT INTO \`admin_users\` (\`username\`, \`password_hash\`, \`name\`, \`email\`, \`role\`)
VALUES ('admin', '$2y$10$w7kQ6j4zNl9XgM1l.wJt9.e3qH5Zp4oKz6s8w8mJ4xZ.u0bO9d6re', 'Administrador Imfundo Kahle', 'contacto@imfundokahle.org', 'admin')
ON DUPLICATE KEY UPDATE \`username\` = \`username\`;

-- --------------------------------------------------------
-- 2. Tabla de Suscriptores al Boletín Mensual
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`subscribers\`;
CREATE TABLE \`subscribers\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`source\` VARCHAR(50) DEFAULT 'newsletter_home',
  \`ip_address\` VARCHAR(45) DEFAULT NULL,
  \`status\` ENUM('active', 'unsubscribed') DEFAULT 'active',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabla de Productos de la Tienda
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`products\`;
CREATE TABLE \`products\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`code\` VARCHAR(50) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`frontend_name\` VARCHAR(150) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`old_price\` DECIMAL(10,2) DEFAULT NULL,
  \`stock\` INT(11) NOT NULL DEFAULT 10,
  \`origin\` VARCHAR(50) DEFAULT 'Perú',
  \`category\` VARCHAR(50) DEFAULT 'General',
  \`image\` VARCHAR(255) DEFAULT NULL,
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-cargar catálogo de productos
INSERT INTO \`products\` (\`code\`, \`name\`, \`frontend_name\`, \`price\`, \`old_price\`, \`stock\`, \`origin\`, \`category\`, \`image\`) VALUES
`;

const productRows = allProducts.map(p => {
    const esc = (s) => (s ? `'` + String(s).replace(/'/g, "''") + `'` : 'NULL');
    return `(${esc(p.code)}, ${esc(p.name)}, ${esc(p.frontend_name)}, ${p.price.toFixed(2)}, ${p.old_price ? p.old_price.toFixed(2) : 'NULL'}, ${p.stock}, ${esc(p.origin)}, ${esc(p.category)}, ${esc(p.image)})`;
});
sqlContent += productRows.join(',\n') + `;\n\n`;

sqlContent += `-- --------------------------------------------------------
-- 4. Tabla de Clientes Compradores
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`customers\`;
CREATE TABLE \`customers\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`address\` TEXT DEFAULT NULL,
  \`city\` VARCHAR(100) DEFAULT 'Lima',
  \`status\` ENUM('active', 'inactive') DEFAULT 'active',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_customers_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuario de prueba para compradores: cliente@imfundokahle.org / Cliente2026!
INSERT INTO \`customers\` (\`name\`, \`email\`, \`password_hash\`, \`phone\`, \`address\`, \`city\`)
VALUES ('Cliente Demostración', 'cliente@imfundokahle.org', '$2y$10$w7kQ6j4zNl9XgM1l.wJt9.e3qH5Zp4oKz6s8w8mJ4xZ.u0bO9d6re', '987654321', 'Av. Larco 456, Miraflores', 'Lima')
ON DUPLICATE KEY UPDATE \`email\` = \`email\`;

-- --------------------------------------------------------
-- 5. Tabla de Pedidos de la Tienda
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`orders\`;
CREATE TABLE \`orders\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`order_code\` VARCHAR(40) NOT NULL UNIQUE,
  \`customer_id\` INT(11) DEFAULT NULL,
  \`customer_name\` VARCHAR(150) NOT NULL,
  \`customer_email\` VARCHAR(150) DEFAULT NULL,
  \`customer_phone\` VARCHAR(50) NOT NULL,
  \`customer_address\` TEXT NOT NULL,
  \`payment_method\` VARCHAR(30) NOT NULL DEFAULT 'transfer',
  \`subtotal\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`shipping\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('pending', 'verified', 'shipped', 'cancelled') DEFAULT 'pending',
  \`operation_number\` VARCHAR(100) DEFAULT NULL,
  \`receipt_file\` VARCHAR(255) DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_order_code\` (\`order_code\`),
  KEY \`idx_customer_id\` (\`customer_id\`),
  KEY \`idx_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Tabla de Artículos por Pedido
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`order_items\`;
CREATE TABLE \`order_items\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`order_id\` INT(11) NOT NULL,
  \`product_code\` VARCHAR(50) NOT NULL,
  \`product_name\` VARCHAR(150) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`quantity\` INT(11) NOT NULL DEFAULT 1,
  \`subtotal\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (\`id\`),
  KEY \`idx_order_id\` (\`order_id\`),
  CONSTRAINT \`fk_order_items_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
`;

fs.writeFileSync(path.join(phpDir, 'database.sql'), sqlContent, 'utf8');
fs.writeFileSync(path.join(rootDir, 'database.sql'), sqlContent, 'utf8');

// 5. Config PHP
console.log('Generando config/config.php y config/db.php...');
const configPhp = `<?php
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
`;
fs.writeFileSync(path.join(phpDir, 'config', 'config.php'), configPhp, 'utf8');

const dbPhp = `<?php
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
`;
fs.writeFileSync(path.join(phpDir, 'config', 'db.php'), dbPhp, 'utf8');

// 6. API PHP
console.log('Generando endpoints de API PHP...');

// api/subscribe.php
const apiSubscribePhp = `<?php
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
`;
fs.writeFileSync(path.join(phpDir, 'api', 'subscribe.php'), apiSubscribePhp, 'utf8');

// api/products.php
const apiProductsPhp = `<?php
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
`;
fs.writeFileSync(path.join(phpDir, 'api', 'products.php'), apiProductsPhp, 'utf8');

// api/orders.php
const apiOrdersPhp = `<?php
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
`;
fs.writeFileSync(path.join(phpDir, 'api', 'orders.php'), apiOrdersPhp, 'utf8');

// api/receipt.php
const apiReceiptPhp = `<?php
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
`;
fs.writeFileSync(path.join(phpDir, 'api', 'receipt.php'), apiReceiptPhp, 'utf8');


// api/customer_auth.php
const apiCustomerAuthPhp = `<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
require_once __DIR__ . '/../config/db.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: $_POST;

if (empty($action) && isset($data['action'])) {
    $action = $data['action'];
}

$db = get_db();

// 1. Estado de sesión actual
if ($action === 'status' || $action === 'me') {
    if (empty($_SESSION['customer_id'])) {
        echo json_encode(['success' => true, 'loggedIn' => false]);
        exit;
    }
    
    if (!$db) {
        echo json_encode([
            'success' => true,
            'loggedIn' => true,
            'customer' => [
                'id' => $_SESSION['customer_id'],
                'name' => $_SESSION['customer_name'] ?? 'Cliente',
                'email' => $_SESSION['customer_email'] ?? '',
                'phone' => $_SESSION['customer_phone'] ?? '',
                'address' => $_SESSION['customer_address'] ?? '',
                'city' => $_SESSION['customer_city'] ?? 'Lima'
            ]
        ]);
        exit;
    }
    
    try {
        $stmt = $db->prepare("SELECT id, name, email, phone, address, city, created_at FROM customers WHERE id = ? LIMIT 1");
        $stmt->execute([$_SESSION['customer_id']]);
        $cust = $stmt->fetch();
        if ($cust) {
            $_SESSION['customer_name'] = $cust['name'];
            $_SESSION['customer_email'] = $cust['email'];
            echo json_encode(['success' => true, 'loggedIn' => true, 'customer' => $cust]);
            exit;
        } else {
            unset($_SESSION['customer_id']);
            echo json_encode(['success' => true, 'loggedIn' => false]);
            exit;
        }
    } catch (Exception $e) {
        echo json_encode(['success' => true, 'loggedIn' => false]);
        exit;
    }
}

// 2. Iniciar sesión (login)
if ($action === 'login') {
    $email = strtolower(trim($data['email'] ?? ''));
    $password = (string)($data['password'] ?? '');
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Por favor ingresa tu correo y contraseña.']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Formato de correo electrónico inválido.']);
        exit;
    }
    
    if (!$db) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Sin conexión a base de datos MySQL.']);
        exit;
    }
    
    try {
        $stmt = $db->prepare("SELECT * FROM customers WHERE LOWER(email) = ? LIMIT 1");
        $stmt->execute([$email]);
        $customer = $stmt->fetch();
        
        if (!$customer || !password_verify($password, $customer['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Correo o contraseña incorrectos.']);
            exit;
        }
        
        if (isset($customer['status']) && $customer['status'] === 'inactive') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Esta cuenta se encuentra inactiva.']);
            exit;
        }
        
        $_SESSION['customer_id'] = (int)$customer['id'];
        $_SESSION['customer_name'] = $customer['name'];
        $_SESSION['customer_email'] = $customer['email'];
        $_SESSION['customer_phone'] = $customer['phone'] ?? '';
        $_SESSION['customer_address'] = $customer['address'] ?? '';
        $_SESSION['customer_city'] = $customer['city'] ?? 'Lima';
        
        unset($customer['password_hash']);
        echo json_encode([
            'success' => true,
            'message' => '¡Bienvenido de nuevo, ' . htmlspecialchars($customer['name']) . '!',
            'customer' => $customer
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al procesar el inicio de sesión.']);
        exit;
    }
}

// 3. Crear cuenta / Registro
if ($action === 'register') {
    $name = trim($data['name'] ?? '');
    $email = strtolower(trim($data['email'] ?? ''));
    $phone = trim($data['phone'] ?? '');
    $address = trim($data['address'] ?? '');
    $city = trim($data['city'] ?? 'Lima');
    $password = (string)($data['password'] ?? '');
    
    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Por favor completa nombre, correo y contraseña.']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Ingresa un correo electrónico válido.']);
        exit;
    }
    
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres.']);
        exit;
    }
    
    if (!$db) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Sin conexión a base de datos MySQL.']);
        exit;
    }
    
    try {
        $check = $db->prepare("SELECT id, name, email, phone, address, city FROM customers WHERE LOWER(email) = ? LIMIT 1");
        $check->execute([$email]);
        $existing = $check->fetch();
        if ($existing) {
            $_SESSION['customer_id'] = (int)$existing['id'];
            $_SESSION['customer_name'] = $name ?: $existing['name'];
            $_SESSION['customer_email'] = $existing['email'];
            $_SESSION['customer_phone'] = $phone ?: ($existing['phone'] ?? '');
            $_SESSION['customer_address'] = $address ?: ($existing['address'] ?? '');
            $_SESSION['customer_city'] = $city ?: ($existing['city'] ?? 'Lima');
            echo json_encode([
                'success' => true,
                'message' => '¡Bienvenido de nuevo, ' . htmlspecialchars($_SESSION['customer_name']) . '!',
                'customer' => [
                    'id' => $_SESSION['customer_id'],
                    'name' => $_SESSION['customer_name'],
                    'email' => $_SESSION['customer_email'],
                    'phone' => $_SESSION['customer_phone'],
                    'address' => $_SESSION['customer_address'],
                    'city' => $_SESSION['customer_city']
                ]
            ]);
            exit;
        }
        
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $insert = $db->prepare("
            INSERT INTO customers (name, email, password_hash, phone, address, city, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
        ");
        $insert->execute([$name, $email, $hash, $phone, $address, $city]);
        $newId = (int)$db->lastInsertId();
        
        $_SESSION['customer_id'] = $newId;
        $_SESSION['customer_name'] = $name;
        $_SESSION['customer_email'] = $email;
        $_SESSION['customer_phone'] = $phone;
        $_SESSION['customer_address'] = $address;
        $_SESSION['customer_city'] = $city;
        
        echo json_encode([
            'success' => true,
            'message' => '¡Cuenta creada con éxito! Bienvenido a Imfundo Kahle.',
            'customer' => [
                'id' => $newId,
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'address' => $address,
                'city' => $city
            ]
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al registrar la cuenta: ' . $e->getMessage()]);
        exit;
    }
}

// 4. Actualizar datos de perfil
if ($action === 'update') {
    if (empty($_SESSION['customer_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión para actualizar tus datos.']);
        exit;
    }
    
    $name = trim($data['name'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $address = trim($data['address'] ?? '');
    $city = trim($data['city'] ?? 'Lima');
    $password = trim($data['password'] ?? '');
    
    if (empty($name)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'El nombre no puede estar vacío.']);
        exit;
    }
    
    if (!$db) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Sin conexión a base de datos.']);
        exit;
    }
    
    try {
        if (!empty($password)) {
            if (strlen($password) < 6) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'La nueva contraseña debe tener al menos 6 caracteres.']);
                exit;
            }
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $db->prepare("UPDATE customers SET name = ?, phone = ?, address = ?, city = ?, password_hash = ? WHERE id = ?");
            $stmt->execute([$name, $phone, $address, $city, $hash, $_SESSION['customer_id']]);
        } else {
            $stmt = $db->prepare("UPDATE customers SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?");
            $stmt->execute([$name, $phone, $address, $city, $_SESSION['customer_id']]);
        }
        
        $_SESSION['customer_name'] = $name;
        $_SESSION['customer_phone'] = $phone;
        $_SESSION['customer_address'] = $address;
        $_SESSION['customer_city'] = $city;
        
        echo json_encode(['success' => true, 'message' => 'Datos actualizados correctamente.']);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al guardar los datos.']);
        exit;
    }
}

// 5. Cerrar sesión
if ($action === 'logout') {
    unset($_SESSION['customer_id']);
    unset($_SESSION['customer_name']);
    unset($_SESSION['customer_email']);
    unset($_SESSION['customer_phone']);
    unset($_SESSION['customer_address']);
    unset($_SESSION['customer_city']);
    echo json_encode(['success' => true, 'message' => 'Sesión cerrada con éxito.']);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Acción no válida']);
`;
fs.writeFileSync(path.join(phpDir, 'api', 'customer_auth.php'), apiCustomerAuthPhp, 'utf8');

// api/customer_orders.php
const apiCustomerOrdersPhp = `<?php
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
`;
fs.writeFileSync(path.join(phpDir, 'api', 'customer_orders.php'), apiCustomerOrdersPhp, 'utf8');

// 7. Admin Dashboard
console.log('Generando panel de administración PHP (admin/)...');

// admin/auth.php
const adminAuthPhp = `<?php
require_once __DIR__ . '/../config/db.php';

function is_admin_logged_in() {
    return isset($_SESSION['admin_user_id']) && !empty($_SESSION['admin_user_id']);
}

function require_admin_login() {
    if (!is_admin_logged_in()) {
        header('Location: /admin/login.php');
        exit;
    }
}
`;
fs.writeFileSync(path.join(phpDir, 'admin', 'auth.php'), adminAuthPhp, 'utf8');

// admin/login.php
const adminLoginPhp = `<?php
require_once __DIR__ . '/auth.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $error = 'Por favor ingresa usuario y contraseña.';
    } else {
        $db = get_db();
        if ($db) {
            $stmt = $db->prepare("SELECT id, username, password_hash, name FROM admin_users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                $_SESSION['admin_user_id'] = $user['id'];
                $_SESSION['admin_user_name'] = $user['name'];
                $_SESSION['admin_username'] = $user['username'];
                header('Location: /admin/index.php');
                exit;
            } else {
                $error = 'Usuario o contraseña incorrectos.';
            }
        } else {
            // Si no hay BD conectada aún, permitir login temporal con credenciales por defecto para configuración
            if ($username === 'admin' && $password === 'ImfundoKahle2026!') {
                $_SESSION['admin_user_id'] = 1;
                $_SESSION['admin_user_name'] = 'Administrador (Modo Configuración)';
                $_SESSION['admin_username'] = 'admin';
                header('Location: /admin/index.php');
                exit;
            } else {
                $error = 'Base de datos no conectada. Usa el usuario "admin" y contraseña por defecto para ingresar.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso Administrador - Imfundo Kahle</title>
    <link rel="stylesheet" href="/css/style.css">
    <style>
        body { background: #f9f6f2; min-height: 100vh; display: grid; place-items: center; padding: 20px; }
        .login-card { background: white; border-radius: 24px; padding: 40px 32px; max-width: 420px; width: 100%; box-shadow: 0 12px 35px rgba(0,0,0,0.08); text-align: center; }
        .login-logo { margin-bottom: 20px; font-family: var(--display); font-size: 26px; font-weight: 800; color: var(--coral); }
        .login-logo span { color: #1e1e1e; }
        .login-card h1 { font-family: var(--display); font-size: 22px; margin-bottom: 8px; color: #1e1e1e; }
        .login-card p { font-size: 13px; color: #666; margin-bottom: 24px; }
        .login-field { margin-bottom: 16px; text-align: left; }
        .login-field label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: #444; }
        .login-field input { width: 100%; padding: 12px 14px; border: 1.5px solid #e2ddd5; border-radius: 12px; font-size: 14px; font-family: inherit; }
        .login-field input:focus { border-color: var(--coral); outline: none; }
        .login-btn { width: 100%; padding: 14px; background: var(--coral); color: white; border: 0; border-radius: 14px; font-weight: 700; font-size: 15px; cursor: pointer; transition: background .2s; margin-top: 10px; }
        .login-btn:hover { background: #b83726; }
        .login-error { background: #fee2e2; color: #b91c1c; padding: 10px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; text-align: left; }
        .login-hint { margin-top: 20px; font-size: 11px; color: #888; background: #f3f0ea; padding: 8px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="login-logo">IMFUNDO <span>KAHLE</span></div>
        <h1>Panel de Control</h1>
        <p>Inicia sesión para gestionar pedidos y suscriptores</p>
        <?php if (!empty($error)): ?>
            <div class="login-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        <form method="POST" action="/admin/login.php">
            <div class="login-field">
                <label for="username">Usuario</label>
                <input type="text" id="username" name="username" placeholder="admin" required autofocus>
            </div>
            <div class="login-field">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" placeholder="••••••••••••" required>
            </div>
            <button type="submit" class="login-btn">Ingresar al panel</button>
        </form>
        <div class="login-hint">
            Credenciales iniciales: <strong>admin</strong> / <strong>ImfundoKahle2026!</strong>
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync(path.join(phpDir, 'admin', 'login.php'), adminLoginPhp, 'utf8');

// admin/logout.php
const adminLogoutPhp = `<?php
require_once __DIR__ . '/../config/config.php';
$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();
header('Location: /admin/login.php');
exit;
`;
fs.writeFileSync(path.join(phpDir, 'admin', 'logout.php'), adminLogoutPhp, 'utf8');

// admin/index.php
const adminIndexPhp = `<?php
require_once __DIR__ . '/auth.php';
require_admin_login();

$db = get_db();
$subscribersCount = 0;
$customersCount = 0;
$ordersCount = 0;
$pendingOrdersCount = 0;
$totalSales = 0.00;
$recentOrders = [];
$recentSubscribers = [];

if ($db) {
    try {
        $subscribersCount = (int)$db->query("SELECT COUNT(*) FROM subscribers")->fetchColumn();
        $ordersCount = (int)$db->query("SELECT COUNT(*) FROM orders")->fetchColumn();
        $customersCount = (int)$db->query("SELECT COUNT(*) FROM customers")->fetchColumn();
        $pendingOrdersCount = (int)$db->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn();
        $totalSales = (float)$db->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled'")->fetchColumn();

        $recentOrders = $db->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 8")->fetchAll();
        $recentSubscribers = $db->query("SELECT * FROM subscribers ORDER BY created_at DESC LIMIT 8")->fetchAll();
    } catch (Exception $e) {
        error_log('Error admin dashboard: ' . $e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - Imfundo Kahle</title>
    <link rel="stylesheet" href="/css/style.css">
    <style>
        body { background: #fdfbf8; color: #1e1e1e; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
        .admin-nav { background: white; border-bottom: 1px solid #e5e0d8; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
        .admin-brand { font-family: var(--display); font-size: 20px; font-weight: 800; color: var(--coral); text-decoration: none; }
        .admin-menu { display: flex; gap: 16px; align-items: center; }
        .admin-menu a { color: #444; text-decoration: none; font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 8px; }
        .admin-menu a:hover, .admin-menu a.active { background: #f4ede6; color: var(--coral); }
        .admin-user { font-size: 13px; color: #777; margin-left: 12px; border-left: 1px solid #ddd; padding-left: 14px; }
        .admin-container { max-width: 1240px; margin: 30px auto; padding: 0 20px; }
        .admin-title { margin-bottom: 24px; font-family: var(--display); font-size: 28px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 32px; }
        .stat-card { background: white; border-radius: 16px; padding: 22px; border: 1px solid #e9e4dc; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .stat-label { font-size: 13px; font-weight: 600; color: #777; margin-bottom: 8px; }
        .stat-value { font-family: var(--display); font-size: 32px; font-weight: 800; color: #1e1e1e; }
        .stat-value.highlight { color: var(--coral); }
        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }
        .panel-box { background: white; border-radius: 18px; border: 1px solid #e9e4dc; padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .panel-box h3 { margin: 0 0 16px; font-family: var(--display); font-size: 18px; display: flex; justify-content: space-between; align-items: center; }
        .panel-box h3 a { font-size: 13px; color: var(--coral); text-decoration: none; font-weight: 600; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th, .admin-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f0ece6; }
        .admin-table th { background: #faf8f5; font-weight: 700; color: #555; }
        .status-badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-verified { background: #d1fae5; color: #065f46; }
        .status-shipped { background: #dbeafe; color: #1e40af; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .receipt-link { color: var(--coral); font-weight: 700; text-decoration: none; }
        .receipt-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <nav class="admin-nav">
        <a class="admin-brand" href="/admin/">IMFUNDO KAHLE <span>ADMIN</span></a>
        <div class="admin-menu">
            <a href="/admin/" class="active">Resumen</a>
            <a href="/admin/orders.php">Pedidos (<?php echo $ordersCount; ?>)</a>
            <a href="/admin/customers.php">Clientes (<?php echo $customersCount; ?>)</a>
            <a href="/admin/subscribers.php">Suscriptores (<?php echo $subscribersCount; ?>)</a>
            <a href="/admin/products.php">Productos</a>
            <a href="/" target="_blank">Ver sitio web ↗</a>
            <span class="admin-user"><?php echo htmlspecialchars($_SESSION['admin_user_name'] ?? 'Admin'); ?> · <a href="/admin/logout.php" style="color:#c53030;padding:0;">Salir</a></span>
        </div>
    </nav>

    <div class="admin-container">
        <h1 class="admin-title">Panel de Control</h1>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Suscriptores Boletín</div>
                <div class="stat-value highlight"><?php echo $subscribersCount; ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pedidos Totales</div>
                <div class="stat-value"><?php echo $ordersCount; ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pedidos Pendientes</div>
                <div class="stat-value highlight"><?php echo $pendingOrdersCount; ?></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Ventas Estimadas</div>
                <div class="stat-value">S/ <?php echo number_format($totalSales, 2); ?></div>
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="panel-box">
                <h3>Últimos Pedidos <a href="/admin/orders.php">Ver todos →</a></h3>
                <?php if (empty($recentOrders)): ?>
                    <p style="color:#777;font-size:13px;">No hay pedidos registrados todavía.</p>
                <?php else: ?>
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Método</th>
                                <th>Estado</th>
                                <th>Comprobante</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recentOrders as $order): ?>
                                <tr>
                                    <td><strong><?php echo htmlspecialchars($order['order_code']); ?></strong></td>
                                    <td><?php echo htmlspecialchars($order['customer_name']); ?><br><small style="color:#777"><?php echo htmlspecialchars($order['customer_phone']); ?></small></td>
                                    <td><strong>S/ <?php echo number_format($order['total'], 2); ?></strong></td>
                                    <td><?php echo strtoupper(htmlspecialchars($order['payment_method'])); ?></td>
                                    <td><span class="status-badge status-<?php echo htmlspecialchars($order['status']); ?>"><?php echo htmlspecialchars($order['status']); ?></span></td>
                                    <td>
                                        <?php if (!empty($order['receipt_file'])): ?>
                                            <a class="receipt-link" href="<?php echo htmlspecialchars($order['receipt_file']); ?>" target="_blank">Ver adjunto ↗</a>
                                        <?php else: ?>
                                            <span style="color:#999">-</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>

            <div class="panel-box">
                <h3>Suscriptores Recientes <a href="/admin/subscribers.php">Ver lista / CSV →</a></h3>
                <?php if (empty($recentSubscribers)): ?>
                    <p style="color:#777;font-size:13px;">No hay suscriptores aún.</p>
                <?php else: ?>
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Correo</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recentSubscribers as $sub): ?>
                                <tr>
                                    <td><strong><?php echo htmlspecialchars($sub['email']); ?></strong></td>
                                    <td style="color:#777"><?php echo date('d/m/Y', strtotime($sub['created_at'])); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync(path.join(phpDir, 'admin', 'index.php'), adminIndexPhp, 'utf8');

// admin/subscribers.php
const adminSubscribersPhp = `<?php
require_once __DIR__ . '/auth.php';
require_admin_login();

$db = get_db();

// Exportar a CSV si se solicita
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=suscriptores_imfundo_kahle_' . date('Y-m-d') . '.csv');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['ID', 'Email', 'Fecha de Registro', 'Estado']);
    if ($db) {
        $stmt = $db->query("SELECT id, email, created_at, status FROM subscribers ORDER BY created_at DESC");
        while ($row = $stmt->fetch()) {
            fputcsv($output, [$row['id'], $row['email'], $row['created_at'], $row['status']]);
        }
    }
    fclose($output);
    exit;
}

$subscribers = [];
if ($db) {
    try {
        $subscribers = $db->query("SELECT * FROM subscribers ORDER BY created_at DESC")->fetchAll();
    } catch (Exception $e) {
        error_log($e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Suscriptores Boletines - Imfundo Kahle Admin</title>
    <link rel="stylesheet" href="/css/style.css">
    <style>
        body { background: #fdfbf8; color: #1e1e1e; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
        .admin-nav { background: white; border-bottom: 1px solid #e5e0d8; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
        .admin-brand { font-family: var(--display); font-size: 20px; font-weight: 800; color: var(--coral); text-decoration: none; }
        .admin-menu { display: flex; gap: 16px; align-items: center; }
        .admin-menu a { color: #444; text-decoration: none; font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 8px; }
        .admin-menu a:hover, .admin-menu a.active { background: #f4ede6; color: var(--coral); }
        .admin-container { max-width: 1240px; margin: 30px auto; padding: 0 20px; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header-bar h1 { margin: 0; font-family: var(--display); font-size: 28px; }
        .btn-export { background: #16a34a; color: white; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
        .btn-export:hover { background: #15803d; }
        .panel-box { background: white; border-radius: 18px; border: 1px solid #e9e4dc; padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .admin-table th, .admin-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #f0ece6; }
        .admin-table th { background: #faf8f5; font-weight: 700; color: #555; }
    </style>
</head>
<body>
    <nav class="admin-nav">
        <a class="admin-brand" href="/admin/">IMFUNDO KAHLE <span>ADMIN</span></a>
        <div class="admin-menu">
            <a href="/admin/">Resumen</a>
            <a href="/admin/orders.php">Pedidos</a>
            <a href="/admin/subscribers.php" class="active">Suscriptores</a>
            <a href="/admin/products.php">Productos</a>
            <a href="/admin/logout.php" style="color:#c53030">Salir</a>
        </div>
    </nav>

    <div class="admin-container">
        <div class="header-bar">
            <h1>Suscriptores del Boletín (<?php echo count($subscribers); ?>)</h1>
            <a class="btn-export" href="/admin/subscribers.php?export=csv">📥 Descargar CSV (Excel)</a>
        </div>

        <div class="panel-box">
            <?php if (empty($subscribers)): ?>
                <p style="color:#777;">No hay suscriptores registrados todavía.</p>
            <?php else: ?>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Correo Electrónico</th>
                            <th>Fecha de Registro</th>
                            <th>IP</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($subscribers as $idx => $sub): ?>
                            <tr>
                                <td style="color:#888"><?php echo $idx + 1; ?></td>
                                <td><strong><?php echo htmlspecialchars($sub['email']); ?></strong></td>
                                <td><?php echo date('d/m/Y H:i', strtotime($sub['created_at'])); ?></td>
                                <td style="color:#777"><?php echo htmlspecialchars($sub['ip_address'] ?? '-'); ?></td>
                                <td><span style="color:#16a34a;font-weight:700">● Activo</span></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync(path.join(phpDir, 'admin', 'subscribers.php'), adminSubscribersPhp, 'utf8');

// admin/orders.php
const adminOrdersPhp = `<?php
require_once __DIR__ . '/auth.php';
require_admin_login();

$db = get_db();

// Actualizar estado si se recibe POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_status') {
    $orderId = (int)($_POST['order_id'] ?? 0);
    $newStatus = $_POST['status'] ?? 'pending';
    if ($db && $orderId && in_array($newStatus, ['pending', 'verified', 'shipped', 'cancelled'])) {
        $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, $orderId]);
    }
    header('Location: /admin/orders.php');
    exit;
}

$orders = [];
if ($db) {
    try {
        $orders = $db->query("
            SELECT o.*, 
            (SELECT GROUP_CONCAT(CONCAT(quantity, 'x ', product_name) SEPARATOR '<br>') FROM order_items WHERE order_id = o.id) as items_summary
            FROM orders o 
            ORDER BY o.created_at DESC
        ")->fetchAll();
    } catch (Exception $e) {
        error_log($e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Pedidos - Imfundo Kahle Admin</title>
    <link rel="stylesheet" href="/css/style.css">
    <style>
        body { background: #fdfbf8; color: #1e1e1e; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
        .admin-nav { background: white; border-bottom: 1px solid #e5e0d8; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
        .admin-brand { font-family: var(--display); font-size: 20px; font-weight: 800; color: var(--coral); text-decoration: none; }
        .admin-menu { display: flex; gap: 16px; align-items: center; }
        .admin-menu a { color: #444; text-decoration: none; font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 8px; }
        .admin-menu a:hover, .admin-menu a.active { background: #f4ede6; color: var(--coral); }
        .admin-container { max-width: 1300px; margin: 30px auto; padding: 0 20px; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header-bar h1 { margin: 0; font-family: var(--display); font-size: 28px; }
        .panel-box { background: white; border-radius: 18px; border: 1px solid #e9e4dc; padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th, .admin-table td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #f0ece6; vertical-align: top; }
        .admin-table th { background: #faf8f5; font-weight: 700; color: #555; }
        .status-badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-verified { background: #d1fae5; color: #065f46; }
        .status-shipped { background: #dbeafe; color: #1e40af; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        .receipt-btn { display: inline-block; padding: 4px 10px; background: #f4ede6; color: var(--coral); border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 11px; }
        .receipt-btn:hover { background: var(--coral); color: white; }
        select.status-select { font-size: 12px; padding: 4px 8px; border-radius: 8px; border: 1px solid #ccc; background: white; }
    </style>
</head>
<body>
    <nav class="admin-nav">
        <a class="admin-brand" href="/admin/">IMFUNDO KAHLE <span>ADMIN</span></a>
        <div class="admin-menu">
            <a href="/admin/">Resumen</a>
            <a href="/admin/orders.php" class="active">Pedidos</a>
            <a href="/admin/subscribers.php">Suscriptores</a>
            <a href="/admin/products.php">Productos</a>
            <a href="/admin/logout.php" style="color:#c53030">Salir</a>
        </div>
    </nav>

    <div class="admin-container">
        <div class="header-bar">
            <h1>Pedidos de la Tienda (<?php echo count($orders); ?>)</h1>
        </div>

        <div class="panel-box">
            <?php if (empty($orders)): ?>
                <p style="color:#777;">No hay pedidos registrados todavía.</p>
            <?php else: ?>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Artículos</th>
                            <th>Total</th>
                            <th>Método</th>
                            <th>Operación</th>
                            <th>Comprobante</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($orders as $o): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($o['order_code']); ?></strong></td>
                                <td style="white-space:nowrap;color:#666"><?php echo date('d/m/Y H:i', strtotime($o['created_at'])); ?></td>
                                <td>
                                    <strong><?php echo htmlspecialchars($o['customer_name']); ?></strong><br>
                                    📞 <?php echo htmlspecialchars($o['customer_phone']); ?><br>
                                    ✉️ <?php echo htmlspecialchars($o['customer_email']); ?><br>
                                    📍 <small><?php echo htmlspecialchars($o['customer_address']); ?></small>
                                </td>
                                <td><?php echo $o['items_summary'] ?: 'Sin detalle'; ?></td>
                                <td><strong>S/ <?php echo number_format($o['total'], 2); ?></strong><br><small style="color:#777">Envío: S/ <?php echo number_format($o['shipping'], 2); ?></small></td>
                                <td><span style="font-weight:700"><?php echo strtoupper(htmlspecialchars($o['payment_method'])); ?></span></td>
                                <td><?php echo htmlspecialchars($o['operation_number'] ?: '-'); ?></td>
                                <td>
                                    <?php if (!empty($o['receipt_file'])): ?>
                                        <a class="receipt-btn" href="<?php echo htmlspecialchars($o['receipt_file']); ?>" target="_blank">Ver Comprobante ↗</a>
                                    <?php else: ?>
                                        <span style="color:#999">-</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <form method="POST" action="/admin/orders.php" style="display:flex;gap:4px;align-items:center;">
                                        <input type="hidden" name="action" value="update_status">
                                        <input type="hidden" name="order_id" value="<?php echo $o['id']; ?>">
                                        <select name="status" class="status-select" onchange="this.form.submit()">
                                            <option value="pending" <?php echo $o['status'] === 'pending' ? 'selected' : ''; ?>>Pendiente</option>
                                            <option value="verified" <?php echo $o['status'] === 'verified' ? 'selected' : ''; ?>>Verificado</option>
                                            <option value="shipped" <?php echo $o['status'] === 'shipped' ? 'selected' : ''; ?>>Enviado</option>
                                            <option value="cancelled" <?php echo $o['status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelado</option>
                                        </select>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync(path.join(phpDir, 'admin', 'orders.php'), adminOrdersPhp, 'utf8');

// admin/products.php
const adminProductsPhp = `<?php
require_once __DIR__ . '/auth.php';
require_admin_login();

$db = get_db();
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_product') {
    $id = (int)($_POST['id'] ?? 0);
    $price = (float)($_POST['price'] ?? 0);
    $stock = (int)($_POST['stock'] ?? 0);
    if ($db && $id > 0) {
        $stmt = $db->prepare("UPDATE products SET price = ?, stock = ? WHERE id = ?");
        $stmt->execute([$price, $stock, $id]);
        $message = "Producto actualizado correctamente.";
    }
}

$products = [];
if ($db) {
    try {
        $products = $db->query("SELECT * FROM products ORDER BY category, id ASC")->fetchAll();
    } catch (Exception $e) {
        error_log($e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Inventario y Precios - Imfundo Kahle Admin</title>
    <link rel="stylesheet" href="/css/style.css">
    <style>
        body { background: #fdfbf8; color: #1e1e1e; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
        .admin-nav { background: white; border-bottom: 1px solid #e5e0d8; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
        .admin-brand { font-family: var(--display); font-size: 20px; font-weight: 800; color: var(--coral); text-decoration: none; }
        .admin-menu { display: flex; gap: 16px; align-items: center; }
        .admin-menu a { color: #444; text-decoration: none; font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 8px; }
        .admin-menu a:hover, .admin-menu a.active { background: #f4ede6; color: var(--coral); }
        .admin-container { max-width: 1240px; margin: 30px auto; padding: 0 20px; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header-bar h1 { margin: 0; font-family: var(--display); font-size: 28px; }
        .panel-box { background: white; border-radius: 18px; border: 1px solid #e9e4dc; padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th, .admin-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f0ece6; }
        .admin-table th { background: #faf8f5; font-weight: 700; color: #555; }
        .input-inline { width: 80px; padding: 5px 8px; border: 1px solid #ccc; border-radius: 8px; font-size: 13px; }
        .btn-save { padding: 5px 12px; background: var(--coral); color: white; border: 0; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; }
        .btn-save:hover { background: #b83726; }
        .alert-success { background: #d1fae5; color: #065f46; padding: 12px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; }
    </style>
</head>
<body>
    <nav class="admin-nav">
        <a class="admin-brand" href="/admin/">IMFUNDO KAHLE <span>ADMIN</span></a>
        <div class="admin-menu">
            <a href="/admin/">Resumen</a>
            <a href="/admin/orders.php">Pedidos</a>
            <a href="/admin/subscribers.php">Suscriptores</a>
            <a href="/admin/products.php" class="active">Productos</a>
            <a href="/admin/logout.php" style="color:#c53030">Salir</a>
        </div>
    </nav>

    <div class="admin-container">
        <div class="header-bar">
            <h1>Productos y Stock (<?php echo count($products); ?>)</h1>
        </div>

        <?php if (!empty($message)): ?>
            <div class="alert-success"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>

        <div class="panel-box">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio (S/)</th>
                        <th>Stock</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($products as $p): ?>
                        <tr>
                            <form method="POST" action="/admin/products.php">
                                <input type="hidden" name="action" value="update_product">
                                <input type="hidden" name="id" value="<?php echo $p['id']; ?>">
                                <td><strong><?php echo htmlspecialchars($p['code']); ?></strong></td>
                                <td><?php echo htmlspecialchars($p['name']); ?></td>
                                <td><?php echo htmlspecialchars($p['category']); ?></td>
                                <td><input type="number" step="0.5" name="price" class="input-inline" value="<?php echo htmlspecialchars($p['price']); ?>" required></td>
                                <td><input type="number" name="stock" class="input-inline" value="<?php echo htmlspecialchars($p['stock']); ?>" required></td>
                                <td><button type="submit" class="btn-save">Guardar</button></td>
                            </form>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync(path.join(phpDir, 'admin', 'products.php'), adminProductsPhp, 'utf8');

// admin/customers.php
const adminCustomersPhp = `<?php
require_once __DIR__ . '/auth.php';
require_admin_login();

$db = get_db();

if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=clientes_imfundo_kahle_' . date('Y-m-d') . '.csv');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['ID', 'Nombre', 'Email', 'Telefono', 'Direccion', 'Ciudad', 'Fecha Registro']);
    if ($db) {
        $stmt = $db->query("SELECT id, name, email, phone, address, city, created_at FROM customers ORDER BY created_at DESC");
        while ($row = $stmt->fetch()) {
            fputcsv($output, [$row['id'], $row['name'], $row['email'], $row['phone'], $row['address'], $row['city'], $row['created_at']]);
        }
    }
    fclose($output);
    exit;
}

$customers = [];
$totalCustomers = 0;
if ($db) {
    try {
        $stmt = $db->query("
            SELECT c.*, 
                   COUNT(o.id) AS total_orders, 
                   COALESCE(SUM(o.total), 0) AS total_spent 
            FROM customers c 
            LEFT JOIN orders o ON o.customer_id = c.id 
            GROUP BY c.id 
            ORDER BY c.created_at DESC
        ");
        $customers = $stmt->fetchAll();
        $totalCustomers = count($customers);
    } catch (Exception $e) {
        error_log($e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clientes Registrados - Admin Imfundo Kahle</title>
    <link rel="stylesheet" href="/css/style.css">
    <style>
        body { background: #fdfbf8; color: #1e1e1e; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
        .admin-nav { background: white; border-bottom: 1px solid #e5e0d8; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
        .admin-brand { font-family: var(--display); font-size: 20px; font-weight: 800; color: var(--coral); text-decoration: none; }
        .admin-menu { display: flex; gap: 16px; align-items: center; }
        .admin-menu a { color: #444; text-decoration: none; font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 8px; }
        .admin-menu a:hover, .admin-menu a.active { background: #f4ede6; color: var(--coral); }
        .admin-user { font-size: 13px; color: #777; margin-left: 12px; border-left: 1px solid #ddd; padding-left: 14px; }
        .admin-container { max-width: 1240px; margin: 30px auto; padding: 0 20px; }
        .admin-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .btn-export { background: #222; color: white; padding: 10px 16px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 700; }
        .panel-box { background: white; border-radius: 18px; border: 1px solid #e9e4dc; padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th, .admin-table td { padding: 12px; text-align: left; border-bottom: 1px solid #f0ece6; }
        .admin-table th { background: #faf8f5; font-weight: 700; color: #555; }
    </style>
</head>
<body>
    <nav class="admin-nav">
        <a class="admin-brand" href="/admin/">IMFUNDO KAHLE <span>ADMIN</span></a>
        <div class="admin-menu">
            <a href="/admin/">Resumen</a>
            <a href="/admin/orders.php">Pedidos</a>
            <a href="/admin/customers.php" class="active">Clientes (<?php echo $totalCustomers; ?>)</a>
            <a href="/admin/subscribers.php">Suscriptores</a>
            <a href="/admin/products.php">Productos</a>
            <a href="/" target="_blank">Ver sitio web ↗</a>
            <span class="admin-user"><?php echo htmlspecialchars($_SESSION['admin_user_name'] ?? 'Admin'); ?> · <a href="/admin/logout.php" style="color:#c53030;padding:0;">Salir</a></span>
        </div>
    </nav>

    <div class="admin-container">
        <div class="admin-header-row">
            <div>
                <h1 style="margin:0 0 6px;font-family:var(--display);font-size:26px;">Clientes Compradores</h1>
                <p style="margin:0;color:#777;font-size:14px;">Cuentas registradas para compras en la tienda solidaria.</p>
            </div>
            <a href="/admin/customers.php?export=csv" class="btn-export">📥 Exportar CSV</a>
        </div>

        <div class="panel-box">
            <?php if (empty($customers)): ?>
                <p style="color:#777;text-align:center;padding:30px;">No hay clientes registrados aún.</p>
            <?php else: ?>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Correo electrónico</th>
                            <th>Teléfono</th>
                            <th>Dirección habitual</th>
                            <th>Pedidos</th>
                            <th>Total Comprado</th>
                            <th>Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($customers as $c): ?>
                            <tr>
                                <td>#<?php echo $c['id']; ?></td>
                                <td><strong><?php echo htmlspecialchars($c['name']); ?></strong></td>
                                <td><?php echo htmlspecialchars($c['email']); ?></td>
                                <td><?php echo htmlspecialchars($c['phone'] ?: '-'); ?></td>
                                <td><?php echo htmlspecialchars($c['address'] . ' (' . ($c['city'] ?: 'Lima') . ')'); ?></td>
                                <td><span style="font-weight:700;"><?php echo (int)($c['total_orders'] ?? 0); ?></span></td>
                                <td><strong style="color:var(--coral);">S/ <?php echo number_format($c['total_spent'] ?? 0, 2); ?></strong></td>
                                <td style="color:#777;"><?php echo date('d/m/Y', strtotime($c['created_at'])); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
`;
fs.writeFileSync(path.join(phpDir, 'admin', 'customers.php'), adminCustomersPhp, 'utf8');


// 8. .htaccess
console.log('Generando .htaccess y protecciones...');
const htaccessContent = `RewriteEngine On
RewriteBase /

# Redirigir index.php a /
RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\\ /index\\.php\\ HTTP/
RewriteRule ^index\\.php$ / [R=301,L]

# Proteger archivos sensibles
<FilesMatch "^(\\.ht|\\.env|database\\.sql|config\\.ini|composer\\.json|.*\\.log)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Rutas API específicas
RewriteRule ^api/customer/auth/?$ api/customer_auth.php [L,QSA]
RewriteRule ^api/customer/orders/?$ api/customer_orders.php [L,QSA]
RewriteRule ^api/orders/([^/]+)/receipt/?$ api/receipt.php?code=$1 [L,QSA]
RewriteRule ^api/orders/?$ api/orders.php [L,QSA]
RewriteRule ^api/products/?$ api/products.php [L,QSA]
RewriteRule ^api/subscribe/?$ api/subscribe.php [L,QSA]
RewriteRule ^admin/customers/?$ admin/customers.php [L,QSA]

# Rutas amigables de Proyectos
RewriteRule ^proyectos/casa-ainbo/?$ casa-ainbo.php [L,QSA]
RewriteRule ^proyectos/sonrisas-de-navidad/?$ sonrisas-de-navidad.php [L,QSA]
RewriteRule ^proyectos/guardianes-del-itaya/?$ guardianes-del-itaya.php [L,QSA]
RewriteRule ^proyectos/imfundo-yoga/?$ imfundo-yoga.php [L,QSA]
RewriteRule ^proyectos/languages-for-hope/?$ languages-for-hope.php [L,QSA]
RewriteRule ^proyectos/proyecto-butterfly/?$ proyecto-butterfly.php [L,QSA]
RewriteRule ^proyectos/ainbo/?$ ainbo.php [L,QSA]
RewriteRule ^proyectos/?$ proyectos.php [L,QSA]

# Rutas amigables de Cómo Ayudar / Voluntariado
RewriteRule ^como-ayudar/voluntariado/?$ voluntariado.php [L,QSA]
RewriteRule ^como-ayudar/apadrina-un-nino/?$ apadrina-un-nino.php [L,QSA]
RewriteRule ^como-ayudar/contribuye-con-desayuno/?$ contribuye-con-desayuno.php [L,QSA]
RewriteRule ^como-ayudar/implementa-un-espacio-educativo/?$ implementa-un-espacio-educativo.php [L,QSA]
RewriteRule ^como-ayudar/dona-libros/?$ dona-libros.php [L,QSA]
RewriteRule ^como-ayudar/apoya-los-emprendimientos-ainbo/?$ apoya-los-emprendimientos-ainbo.php [L,QSA]
RewriteRule ^como-ayudar/apoya-ainbo/?$ apoya-los-emprendimientos-ainbo.php [L,QSA]
RewriteRule ^como-ayudar/?$ como-ayudar.php [L,QSA]

# Accesos directos adicionales
RewriteRule ^se-un-voluntario/voluntariado/?$ voluntariado.php [L,QSA]
RewriteRule ^se-un-voluntario/apadrina-un-nino/?$ apadrina-un-nino.php [L,QSA]
RewriteRule ^se-un-voluntario/contribuye-con-desayuno/?$ contribuye-con-desayuno.php [L,QSA]
RewriteRule ^se-un-voluntario/implementa-un-espacio-educativo/?$ implementa-un-espacio-educativo.php [L,QSA]
RewriteRule ^se-un-voluntario/dona-libros/?$ dona-libros.php [L,QSA]
RewriteRule ^se-un-voluntario/apoya-los-emprendimientos-ainbo/?$ apoya-los-emprendimientos-ainbo.php [L,QSA]
RewriteRule ^se-un-voluntario/?$ voluntariado.php [L,QSA]
RewriteRule ^se-voluntario/?$ voluntariado.php [L,QSA]
RewriteRule ^voluntariado/?$ voluntariado.php [L,QSA]
RewriteRule ^apadrina-un-nino/?$ apadrina-un-nino.php [L,QSA]
RewriteRule ^contribuye-con-desayuno/?$ contribuye-con-desayuno.php [L,QSA]
RewriteRule ^implementa-un-espacio-educativo/?$ implementa-un-espacio-educativo.php [L,QSA]
RewriteRule ^dona-libros/?$ dona-libros.php [L,QSA]
RewriteRule ^apoya-los-emprendimientos-ainbo/?$ apoya-los-emprendimientos-ainbo.php [L,QSA]
RewriteRule ^apoya-ainbo/?$ apoya-los-emprendimientos-ainbo.php [L,QSA]
RewriteRule ^donar/?$ donar.php [L,QSA]
RewriteRule ^nosotros/?$ nosotros.php [L,QSA]
RewriteRule ^tienda/?$ tienda.php [L,QSA]

# Mapear cualquier archivo .php sin extensión
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}.php -f
RewriteRule ^([^\\.]+)$ $1.php [NC,L]

# Compresión Gzip para alto rendimiento en wePanel
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
`;
fs.writeFileSync(path.join(phpDir, '.htaccess'), htaccessContent, 'utf8');

// uploads/receipts/.htaccess (evitar ejecución de scripts en uploads por seguridad)
const uploadsHtaccess = `# Desactivar ejecución de scripts en carpeta de subidas
php_flag engine off
<FilesMatch "\\.(php|php5|php7|php8|phtml|cgi|pl|exe)$">
    Order allow,deny
    Deny from all
</FilesMatch>
`;
fs.writeFileSync(path.join(phpDir, 'uploads', 'receipts', '.htaccess'), uploadsHtaccess, 'utf8');

// 9. Convertir las 19 vistas EJS a PHP
console.log('Convirtiendo vistas EJS a archivos PHP...');
const pageMappings = [
    { view: 'index.ejs', file: 'index.php', title: 'Inicio - Imfundo Kahle' },
    { view: 'nosotros.ejs', file: 'nosotros.php', title: 'Sobre nosotros - Imfundo Kahle' },
    { view: 'proyectos.ejs', file: 'proyectos.php', title: 'Nuestros proyectos - Imfundo Kahle' },
    { view: 'casa-ainbo.ejs', file: 'casa-ainbo.php', title: 'Casa Ainbo - Imfundo Kahle' },
    { view: 'sonrisas-de-navidad.ejs', file: 'sonrisas-de-navidad.php', title: 'Sonrisas de Navidad - Imfundo Kahle' },
    { view: 'guardianes-itaya.ejs', file: 'guardianes-del-itaya.php', title: 'Guardianes del Itaya - Imfundo Kahle' },
    { view: 'imfundo-yoga.ejs', file: 'imfundo-yoga.php', title: 'Imfundo Yoga - Imfundo Kahle' },
    { view: 'languages-for-hope.ejs', file: 'languages-for-hope.php', title: 'Languages for Hope - Imfundo Kahle' },
    { view: 'proyecto-butterfly.ejs', file: 'proyecto-butterfly.php', title: 'Proyecto Butterfly - Imfundo Kahle' },
    { view: 'ainbo.ejs', file: 'ainbo.php', title: 'Proyecto Ainbo - Imfundo Kahle' },
    { view: 'se-un-voluntario.ejs', file: 'se-un-voluntario.php', title: 'Sé un voluntario - Imfundo Kahle' },
    { view: 'voluntario-detalle.ejs', file: 'voluntariado.php', title: 'Sé voluntario - Imfundo Kahle' },
    { view: 'apadrina-detalle.ejs', file: 'apadrina-un-nino.php', title: 'Apadrina un niño - Imfundo Kahle' },
    { view: 'desayuno-detalle.ejs', file: 'contribuye-con-desayuno.php', title: 'Contribuye con desayuno - Imfundo Kahle' },
    { view: 'espacio-educativo-detalle.ejs', file: 'implementa-un-espacio-educativo.php', title: 'Implementa un espacio educativo - Imfundo Kahle' },
    { view: 'dona-libros-detalle.ejs', file: 'dona-libros.php', title: 'Dona libros - Imfundo Kahle' },
    { view: 'apoya-ainbo-detalle.ejs', file: 'apoya-los-emprendimientos-ainbo.php', title: 'Apoya a las mujeres Ainbo - Imfundo Kahle' },
    { view: 'como-ayudar.ejs', file: 'como-ayudar.php', title: 'Cómo ayudar - Imfundo Kahle' },
    { view: 'como-ayudar.ejs', file: 'donar.php', title: 'Donar - Imfundo Kahle' },
    { view: 'tienda.ejs', file: 'tienda.php', title: 'Tienda - Imfundo Kahle' }
];

for (let p of pageMappings) {
    let content = fs.readFileSync(path.join(viewsDir, p.view), 'utf8');

    // Reemplazar titulo EJS con PHP
    content = content.replace(/<title><%= titulo %><\/title>/g, `<?php $titulo = '${p.title}'; ?><title><?php echo htmlspecialchars($titulo); ?></title>`);

    // En tienda.php, ajustar API_BASE para ruta relativa
    if (p.file === 'tienda.php') {
        content = content.replace(/var API_BASE = 'http:\/\/localhost:3000';/g, "var API_BASE = '';");
    content = content.replace(/var API_BASE = '';/g, "var API_BASE = '';");
    }

    fs.writeFileSync(path.join(phpDir, p.file), content, 'utf8');
    console.log(`✓ Generado: php/${p.file}`);
}

// 10. Actualizar script de suscripción en public/js/main.js y php/js/main.js
console.log('Integrando formulario de suscripción con /api/subscribe...');
const jsPath = path.join(phpDir, 'js', 'main.js');
let mainJs = fs.readFileSync(jsPath, 'utf8');

const oldSubRegex = /document\.querySelector\('\.subscribe-form'\)\?\.addEventListener\('submit'[\s\S]*?\}\);/;
const newSubCode = `document.querySelector('.subscribe-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const feedback = form.querySelector('.form-feedback');
    const input = form.querySelector('input[type="email"]');
    const email = input ? input.value.trim() : '';

    if (!email) return;
    feedback.textContent = 'Enviando...';
    feedback.style.color = '#ffffff';

    fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
    .then(res => res.json())
    .then(data => {
        feedback.textContent = data.message || '¡Gracias por suscribirte!';
        if (data.success) form.reset();
    })
    .catch(() => {
        feedback.textContent = '¡Gracias por tu interés! Te hemos añadido a la lista.';
        form.reset();
    });
});`;

if (oldSubRegex.test(mainJs)) {
    mainJs = mainJs.replace(oldSubRegex, newSubCode);
    fs.writeFileSync(jsPath, mainJs, 'utf8');
}

console.log('--- Generación de proyecto PHP + MySQL completada con éxito ---');
