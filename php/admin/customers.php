<?php
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
