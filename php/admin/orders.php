<?php
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
