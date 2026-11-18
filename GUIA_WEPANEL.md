# Guía Completa de Despliegue en wePanel (Webempresa / cPanel) - Imfundo Kahle

Esta guía explica paso a paso cómo subir y poner en marcha el sitio web de **Imfundo Kahle** con su backend en **PHP** y base de datos **MySQL** en un hosting gestionado con **wePanel** o **cPanel**.

---

## 📦 Contenido del Paquete

El proyecto generado para wePanel se encuentra listo en la carpeta `php/` y comprimido en el archivo:
- **`imfundo_kahle_wepanel.zip`**: Todo el sitio listo para descomprimir en `public_html/`.
- **`database.sql`**: Script SQL con la estructura de tablas y catálogo de productos precargado.

### Estructura de archivos incluida:
```text
public_html/
├── .htaccess                      # Rutas amigables, seguridad y compresión Gzip
├── database.sql                   # Respaldo de estructura de base de datos
├── index.php                      # Página de inicio
├── nosotros.php                   # Quiénes somos
├── proyectos.php                  # Directorio de proyectos
├── casa-ainbo.php                 # Proyecto Casa Ainbo
├── sonrisas-de-navidad.php        # Campaña Sonrisas de Navidad
├── guardianes-del-itaya.php       # Proyecto Guardianes del Itaya
├── imfundo-yoga.php               # Proyecto Imfundo Yoga
├── languages-for-hope.php         # Proyecto Languages for Hope
├── proyecto-butterfly.php         # Proyecto Butterfly
├── ainbo.php                      # Proyecto Ainbo
├── como-ayudar.php                # Página principal de voluntariado/ayuda
├── voluntariado.php               # Formas de voluntariado
├── apadrina-un-nino.php           # Apadrinamiento
├── contribuye-con-desayuno.php    # Donación de desayunos
├── implementa-un-espacio-educativo.php # Espacios educativos
├── dona-libros.php                # Donación de libros
├── apoya-los-emprendimientos-ainbo.php # Emprendimientos comunitarios
├── donar.php                      # Opciones y pasarelas de donación
├── tienda.php                     # Tienda solidaria con carrito y checkout
├── config/
│   ├── config.php                 # Configuración general y constantes
│   └── db.php                     # Conexión MySQL con PDO (EDITAR AQUÍ)
├── api/
│   ├── subscribe.php              # Registro de correos para boletín
│   ├── products.php               # Catálogo de productos (con fallback JSON)
│   ├── orders.php                 # Creación de pedidos y cálculo de totales
│   └── receipt.php                # Subida y validación segura de comprobantes
├── admin/                         # Panel de control protegido
│   ├── auth.php                   # Autenticación y control de sesiones
│   ├── login.php                  # Inicio de sesión del administrador
│   ├── logout.php                 # Cierre seguro de sesión
│   ├── index.php                  # Dashboard con métricas clave
│   ├── orders.php                 # Gestión y verificación de pedidos
│   ├── subscribers.php           # Lista y exportación a CSV de suscriptores
│   └── products.php              # Administración de catálogo y stock
├── uploads/
│   └── receipts/                  # Almacenamiento seguro de comprobantes bancarios
├── css/                           # Estilos CSS
├── js/                            # JavaScript interactivo (carruseles, tienda, etc.)
└── img/                           # Imágenes, portadas de boletines y fotos
```

---

## 🚀 Paso 1: Crear la Base de Datos MySQL en wePanel

1. Inicia sesión en tu **wePanel** (o cPanel).
2. En la sección **Bases de datos**, haz clic en **Bases de datos MySQL**.
3. **Crear una nueva base de datos**:
   - Ingresa un nombre, por ejemplo: `imfundo_db` (el nombre final será similar a `tucuenta_imfundo_db`).
   - Haz clic en **Crear una base de datos**.
4. **Crear un nuevo usuario de base de datos**:
   - En la sección "Usuarios MySQL" -> "Añadir nuevo usuario".
   - Nombre de usuario: ej. `imfundo_user` (nombre final: `tucuenta_imfundo_user`).
   - Genera una contraseña segura y anótala.
   - Haz clic en **Crear usuario**.
5. **Vincular el usuario a la base de datos**:
   - En la sección "Añadir usuario a la base de datos":
     - Selecciona el usuario (`tucuenta_imfundo_user`).
     - Selecciona la base de datos (`tucuenta_imfundo_db`).
     - Haz clic en **Añadir**.
   - En la pantalla de privilegios, marca la casilla **TODOS LOS PRIVILEGIOS** (*ALL PRIVILEGES*).
   - Haz clic en **Hacer cambios** (*Make Changes*).

---

## 🗄️ Paso 2: Importar las Tablas en phpMyAdmin

1. En el menú principal de **wePanel**, abre **phpMyAdmin**.
2. En la columna de la izquierda, selecciona la base de datos que creaste (`tucuenta_imfundo_db`).
3. Ve a la pestaña superior **Importar** (*Import*).
4. Haz clic en **Seleccionar archivo** (*Choose File*) y elige el archivo `database.sql`.
5. Deja las opciones por defecto (formato SQL, UTF-8) y haz clic en el botón inferior **Continuar** o **Importar**.
6. Aparecerá un mensaje verde confirmando la ejecución exitosa de las consultas. Se habrán creado las tablas:
   - `admin_users`: Usuario administrador con contraseña cifrada con BCrypt.
   - `subscribers`: Registro de emails suscritos al boletín mensual.
   - `products`: Catálogo completo de polos y accesorios precargados.
   - `orders`: Pedidos de la tienda, datos de contacto, totales y estado.
   - `order_items`: Detalle de productos por cada pedido.

---

## 📁 Paso 3: Subir los Archivos al Servidor

### Opción A: Mediante el Administrador de Archivos de wePanel (Recomendada y más rápida)
1. En wePanel, abre el **Administrador de Archivos** (*File Manager*).
2. Navega a la carpeta de tu sitio (habitualmente `public_html/` para el dominio principal, o la carpeta del subdominio).
3. Haz clic en el botón superior **Cargar** (*Upload*).
4. Sube el archivo comprimido **`imfundo_kahle_wepanel.zip`**.
5. Una vez completada la subida al 100%, regresa al Administrador de Archivos.
6. Haz clic derecho sobre `imfundo_kahle_wepanel.zip` y selecciona **Extraer** (*Extract*).
7. Confirma la extracción en la ruta actual (`/public_html`).
8. *(Opcional)* Puedes eliminar el archivo `.zip` para liberar espacio en disco.

### Opción B: Mediante FTP (FileZilla)
- Conéctate por SFTP/FTP con tus credenciales de wePanel.
- Abre la carpeta `public_html/`.
- Sube todo el contenido de la carpeta local `php/`.

---

## ⚙️ Paso 4: Configurar la Conexión en `config/db.php`

1. En el **Administrador de Archivos** de wePanel, ve a la carpeta `config/`.
2. Selecciona el archivo **`db.php`**, haz clic derecho y elige **Editar** (*Edit*).
3. Modifica las siguientes líneas con los datos creados en el Paso 1:

```php
// EDITAR ESTOS VALORES CON TUS CREDENCIALES DE WEPANEL
define('DB_HOST', 'localhost');                    // En wePanel siempre es 'localhost'
define('DB_NAME', 'tucuenta_imfundo_db');           // Nombre completo de la BD
define('DB_USER', 'tucuenta_imfundo_user');         // Nombre completo del usuario
define('DB_PASS', 'TuContraseñaSegura123!');        // Contraseña que creaste
define('DB_CHARSET', 'utf8mb4');
```

4. Haz clic en **Guardar cambios** (*Save Changes*).

---

## 🔐 Paso 5: Acceso al Panel de Administración

El sistema incluye un panel de control intuitivo y seguro:

- **URL de acceso:** `https://tudominio.org/admin`
- **Usuario inicial:** `admin`
- **Contraseña inicial:** `ImfundoKahle2026!`

### Funcionalidades del Panel:
- 📊 **Dashboard:** Métricas generales, total recaudado en tienda, pedidos pendientes y suscriptores recientes.
- 📦 **Gestión de Pedidos (`/admin/orders.php`):**
  - Listado de pedidos con filtros por estado (*Pendiente*, *Verificado*, *Enviado*, *Cancelado*).
  - Ver comprobante de transferencia bancaria / Yape subido por el comprador con un clic.
  - Actualizar estado del pedido.
- ✉️ **Suscriptores (`/admin/subscribers.php`):**
  - Ver lista de correos registrados desde el pie de página de la web.
  - **Botón "Exportar CSV"** para descargar la lista completa y usarla en Mailchimp, SendGrid o envíos masivos.
- 🏷️ **Catálogo de Productos (`/admin/products.php`):**
  - Administrar precios, inventario (stock) y activación/desactivación de productos.

> **Importante:** Una vez que inicies sesión por primera vez, puedes cambiar la contraseña o crear nuevos administradores desde la base de datos o solicitar la adición del módulo de gestión de usuarios.

---

## 🛡️ Paso 6: Verificación de Seguridad y Permisos

1. **Rutas amigables (`.htaccess`):**
   - El archivo `.htaccess` incluido activa `mod_rewrite` automáticamente para que URLs como `https://tudominio.org/proyectos/casa-ainbo` o `https://tudominio.org/tienda` funcionen sin mostrar `.php`.
   - Bloquea el acceso web a archivos confidenciales (`.sql`, `.env`, logs).

2. **Permisos de carpeta de subidas:**
   - Verifica que la carpeta `uploads/receipts/` tenga permisos `755` (o `775`) para que los compradores puedan adjuntar su comprobante de pago.
   - Dicha carpeta cuenta con su propio `.htaccess` interno que prohíbe la ejecución de scripts maliciosos, permitiendo solo lectura de imágenes y PDFs.

3. **Compatibilidad PHP:**
   - En wePanel -> **Configuración PHP**, asegúrate de que el dominio tenga seleccionada una versión de **PHP 7.4, 8.0, 8.1, 8.2 o 8.3** (todas son 100% compatibles).
   - Asegúrate de que las extensiones `pdo_mysql`, `fileinfo` y `gd` estén habilitadas (vienen activadas por defecto en wePanel/Webempresa).

---

## 💡 Resumen Rápido de Rutas del Sitio

| Sección | URL amigable | Archivo PHP |
| :--- | :--- | :--- |
| Inicio | `/` | `index.php` |
| Quiénes Somos | `/nosotros` | `nosotros.php` |
| Proyectos | `/proyectos` | `proyectos.php` |
| Casa Ainbo | `/proyectos/casa-ainbo` | `casa-ainbo.php` |
| Sonrisas de Navidad | `/proyectos/sonrisas-de-navidad` | `sonrisas-de-navidad.php` |
| Tienda Solidaria | `/tienda` | `tienda.php` |
| Donaciones | `/donar` | `donar.php` |
| Panel Admin | `/admin` | `admin/index.php` |
| API Suscripción | `/api/subscribe` | `api/subscribe.php` |
| API Pedidos | `/api/orders` | `api/orders.php` |
| API Comprobante | `/api/orders/{codigo}/receipt` | `api/receipt.php` |
