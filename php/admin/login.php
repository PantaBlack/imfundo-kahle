<?php
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
