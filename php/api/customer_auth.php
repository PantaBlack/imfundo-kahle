<?php
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
