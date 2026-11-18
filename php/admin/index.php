<?php
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
