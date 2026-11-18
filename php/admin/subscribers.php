<?php
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
