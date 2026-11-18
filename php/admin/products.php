<?php
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
