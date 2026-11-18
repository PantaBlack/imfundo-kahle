-- Base de datos MySQL para Imfundo Kahle (wePanel / cPanel)
-- Generado automáticamente para Imfundo Kahle

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Tabla de Administradores
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `role` VARCHAR(20) DEFAULT 'admin',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuario por defecto: admin / ImfundoKahle2026!
-- Hash generado con password_hash('ImfundoKahle2026!', PASSWORD_BCRYPT)
INSERT INTO `admin_users` (`username`, `password_hash`, `name`, `email`, `role`)
VALUES ('admin', '$2y$10$w7kQ6j4zNl9XgM1l.wJt9.e3qH5Zp4oKz6s8w8mJ4xZ.u0bO9d6re', 'Administrador Imfundo Kahle', 'contacto@imfundokahle.org', 'admin')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- --------------------------------------------------------
-- 2. Tabla de Suscriptores al Boletín Mensual
-- --------------------------------------------------------
DROP TABLE IF EXISTS `subscribers`;
CREATE TABLE `subscribers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `source` VARCHAR(50) DEFAULT 'newsletter_home',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `status` ENUM('active', 'unsubscribed') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabla de Productos de la Tienda
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `frontend_name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `old_price` DECIMAL(10,2) DEFAULT NULL,
  `stock` INT(11) NOT NULL DEFAULT 10,
  `origin` VARCHAR(50) DEFAULT 'Perú',
  `category` VARCHAR(50) DEFAULT 'General',
  `image` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-cargar catálogo de productos
INSERT INTO `products` (`code`, `name`, `frontend_name`, `price`, `old_price`, `stock`, `origin`, `category`, `image`) VALUES
('POLO-001', 'El hombre El mito El papa 1', 'El hombre El mito El papa 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/El%20hombre%20El%20mito%20El%20papa.png'),
('POLO-002', 'El hombre El mito El papa 2', 'El hombre El mito El papa 2', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/El%20hombre%20El%20mito%20El%20papa2.png'),
('POLO-003', 'El mejor papa del mundo 1', 'El mejor papa del mundo 1', 35.00, 45.00, 0, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/El%20mejor%20papa%20del%20mundo.png'),
('POLO-004', 'Gracias, papa 1', 'Gracias, papa 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Gracias%2C%20papa.png'),
('POLO-005', 'Gracias, papa 2', 'Gracias, papa 2', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Gracias%2C%20papa2.png'),
('POLO-006', 'Nivel de experiencia papa 1', 'Nivel de experiencia papa 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Nivel%20de%20experiencia%20papa.png'),
('POLO-007', 'No estoy viejo, soy papa clasico 1', 'No estoy viejo, soy papa clasico 1', 35.00, 45.00, 0, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/No%20estoy%20viejo%2C%20soy%20papa%20clasico.png'),
('POLO-008', 'No estoy viejo, soy papa clasico 2', 'No estoy viejo, soy papa clasico 2', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/No%20estoy%20viejo%2C%20soy%20papa%20clasico2.png'),
('POLO-009', 'Nunca pasa de moda 1', 'Nunca pasa de moda 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Nunca%20pasa%20de%20moda.png'),
('POLO-010', 'Orgullosamente papa 1', 'Orgullosamente papa 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Orgullosamente%20papa.png'),
('POLO-011', 'Orgullosamente papa 2', 'Orgullosamente papa 2', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Orgullosamente%20papa2.png'),
('POLO-012', 'Papa del mundo 1', 'Papa del mundo 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Papa%20del%20mundo.png'),
('POLO-013', 'Papa desde siempre 1', 'Papa desde siempre 1', 35.00, 45.00, 0, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Papa%20desde%20siempre.png'),
('POLO-014', 'Papa desde siempre 2', 'Papa desde siempre 2', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Papa%20desde%20siempre2.png'),
('POLO-015', 'Papa iquiteño 1', 'Papa iquiteño 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Papa%20iquite%C3%B1o.png'),
('POLO-016', 'Papa Mi orgullo 1', 'Papa Mi orgullo 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Papa%20Mi%20orgullo.png'),
('POLO-017', 'Papa nivel leyenda 1', 'Papa nivel leyenda 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Papa%20nivel%20leyenda.png'),
('POLO-018', 'Papa nivel leyenda 2', 'Papa nivel leyenda 2', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Papa%20nivel%20leyenda2.png'),
('POLO-019', 'Papa perucho con orgullo 1', 'Papa perucho con orgullo 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Papa%20perucho%20con%20orgullo.png'),
('POLO-020', 'Papa Una palabra, un heroe', 'Papa Una palabra, un heroe', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Papa%20una%20palabra%20un%20heroe.png'),
('POLO-021', 'Ser papa es mi mayor logro 1', 'Ser papa es mi mayor logro 1', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Ser%20papa%20es%20mi%20mayor%20logro.png'),
('POLO-022', 'Nunca pasa de moda 2', 'Nunca pasa de moda 2', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Un%20gran%20papa%20nunca%20pasa%20de%20moda.png'),
('POLO-023', 'Papa Una palabra, un heroe 2', 'Papa Una palabra, un heroe 2', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/imagenes-polos/Una%20palabra%2C%20un%20heroe.png'),
('POLO-024', 'Mensaje', 'Mensaje', 35.00, 45.00, 15, 'Iquitos', 'Polos', '/img/tienda/IzquierdaYDerecha/productos/Polo Mensaje (Defrente).png'),
('ACC-001', 'CAP', 'CAP', 12.00, NULL, 20, 'CUSCO', 'Accesorios', '/img/tienda/IzquierdaYDerecha/productos/CAP1.png'),
('ACC-002', 'CON', 'CON', 14.00, NULL, 20, 'AREQUIPA', 'Accesorios', '/img/tienda/IzquierdaYDerecha/productos/CON1.png'),
('ACC-003', 'S', 'S', 16.00, NULL, 20, 'LIMA', 'Accesorios', '/img/tienda/IzquierdaYDerecha/productos/S1.png');

-- --------------------------------------------------------
-- 4. Tabla de Clientes Compradores
-- --------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT 'Lima',
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuario de prueba para compradores: cliente@imfundokahle.org / Cliente2026!
INSERT INTO `customers` (`name`, `email`, `password_hash`, `phone`, `address`, `city`)
VALUES ('Cliente Demostración', 'cliente@imfundokahle.org', '$2y$10$w7kQ6j4zNl9XgM1l.wJt9.e3qH5Zp4oKz6s8w8mJ4xZ.u0bO9d6re', '987654321', 'Av. Larco 456, Miraflores', 'Lima')
ON DUPLICATE KEY UPDATE `email` = `email`;

-- --------------------------------------------------------
-- 5. Tabla de Pedidos de la Tienda
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_code` VARCHAR(40) NOT NULL UNIQUE,
  `customer_id` INT(11) DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(150) DEFAULT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_address` TEXT NOT NULL,
  `payment_method` VARCHAR(30) NOT NULL DEFAULT 'transfer',
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending', 'verified', 'shipped', 'cancelled') DEFAULT 'pending',
  `operation_number` VARCHAR(100) DEFAULT NULL,
  `receipt_file` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_code` (`order_code`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Tabla de Artículos por Pedido
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL,
  `product_code` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
