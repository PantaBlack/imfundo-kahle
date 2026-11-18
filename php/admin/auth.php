<?php
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
