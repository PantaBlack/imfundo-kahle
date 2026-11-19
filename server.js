const express = require('express');
const app = express();
const path = require('path');

// Configuración del motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir archivos estáticos (CSS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Evitar almacenamiento en caché en desarrollo para reflejar cambios de enlaces inmediatamente
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.get('/nosotros', (req, res) => {
    res.render('nosotros', { titulo: 'Sobre nosotros - Imfundo Kahle' });
});

app.get('/proyectos', (req, res) => {
    res.render('proyectos', { titulo: 'Nuestros proyectos - Imfundo Kahle' });
});

app.get('/proyectos/casa-ainbo', (req, res) => {
    res.render('casa-ainbo', { titulo: 'Casa Ainbo - Imfundo Kahle' });
});

app.get('/proyectos/sonrisas-de-navidad', (req, res) => {
    res.render('sonrisas-de-navidad', { titulo: 'Sonrisas de Navidad - Imfundo Kahle' });
});

// Nueva ruta para Guardianes del Itaya
app.get('/proyectos/guardianes-del-itaya', (req, res) => {
    res.render('guardianes-itaya', { titulo: 'Guardianes del Itaya - Imfundo Kahle' });
});

// Nueva ruta para Imfundo Yoga
app.get('/proyectos/imfundo-yoga', (req, res) => {
    res.render('imfundo-yoga', { titulo: 'Imfundo Yoga - Imfundo Kahle' });
});

// Nueva ruta para Proyecto Butterfly
app.get('/proyectos/proyecto-butterfly', (req, res) => {
    res.render('proyecto-butterfly', { titulo: 'Proyecto Butterfly - Imfundo Kahle' });
});

// Nueva ruta para Languages for Hope
app.get('/proyectos/languages-for-hope', (req, res) => {
    res.render('languages-for-hope', { titulo: 'Languages for Hope - Imfundo Kahle' });
});

// Nueva ruta para Proyecto Ainbo (Mujeres)
app.get('/proyectos/ainbo', (req, res) => {
    res.render('ainbo', { titulo: 'Proyecto Ainbo - Imfundo Kahle' });
});

// Nueva ruta para Sé un voluntario
app.get('/se-un-voluntario', (req, res) => {
    res.render('voluntario-detalle', { titulo: 'Sé un voluntario - Imfundo Kahle' });
});

// Detalle para Sé voluntario
app.get('/se-un-voluntario/voluntariado', (req, res) => {
    res.render('voluntario-detalle', { titulo: 'Sé voluntario - Imfundo Kahle' });
});

app.get('/se-voluntario', (req, res) => {
    res.render('voluntario-detalle', { titulo: 'Sé voluntario - Imfundo Kahle' });
});

// Detalle para Apadrina un niño
app.get('/se-un-voluntario/apadrina-un-nino', (req, res) => {
    res.render('apadrina-detalle', { titulo: 'Apadrina un niño - Imfundo Kahle' });
});

app.get('/apadrina-un-nino', (req, res) => {
    res.render('apadrina-detalle', { titulo: 'Apadrina un niño - Imfundo Kahle' });
});

// Detalle para Contribuye con desayuno
app.get('/se-un-voluntario/contribuye-con-desayuno', (req, res) => {
    res.render('desayuno-detalle', { titulo: 'Contribuye con desayuno - Imfundo Kahle' });
});

app.get('/contribuye-con-desayuno', (req, res) => {
    res.render('desayuno-detalle', { titulo: 'Contribuye con desayuno - Imfundo Kahle' });
});

// Detalle para Implementa un espacio educativo
app.get('/se-un-voluntario/implementa-un-espacio-educativo', (req, res) => {
    res.render('espacio-educativo-detalle', { titulo: 'Implementa un espacio educativo - Imfundo Kahle' });
});

app.get('/implementa-un-espacio-educativo', (req, res) => {
    res.render('espacio-educativo-detalle', { titulo: 'Implementa un espacio educativo - Imfundo Kahle' });
});

// Detalle para Dona libros
app.get('/se-un-voluntario/dona-libros', (req, res) => {
    res.render('dona-libros-detalle', { titulo: 'Dona libros - Imfundo Kahle' });
});

app.get('/dona-libros', (req, res) => {
    res.render('dona-libros-detalle', { titulo: 'Dona libros - Imfundo Kahle' });
});

// Detalle para Apoya a las mujeres Ainbo
app.get('/se-un-voluntario/apoya-los-emprendimientos-ainbo', (req, res) => {
    res.render('apoya-ainbo-detalle', { titulo: 'Apoya a las mujeres Ainbo - Imfundo Kahle' });
});

app.get('/apoya-los-emprendimientos-ainbo', (req, res) => {
    res.render('apoya-ainbo-detalle', { titulo: 'Apoya a las mujeres Ainbo - Imfundo Kahle' });
});

app.get('/se-un-voluntario/apoya-ainbo', (req, res) => {
    res.render('apoya-ainbo-detalle', { titulo: 'Apoya a las mujeres Ainbo - Imfundo Kahle' });
});

app.get('/apoya-ainbo', (req, res) => {
    res.render('apoya-ainbo-detalle', { titulo: 'Apoya a las mujeres Ainbo - Imfundo Kahle' });
});

// Nueva ruta para Cómo ayudar
app.get('/como-ayudar', (req, res) => {
    res.render('como-ayudar', { titulo: 'Cómo ayudar - Imfundo Kahle' });
});

// Ruta para Donar (muestra lo mismo que Cómo ayudar)
app.get('/donar', (req, res) => {
    res.render('como-ayudar', { titulo: 'Cómo ayudar - Imfundo Kahle' });
});

// Rutas /como-ayudar/... (mismas páginas de detalle)
app.get('/como-ayudar/voluntariado', (req, res) => {
    res.render('voluntario-detalle', { titulo: 'Sé voluntario - Imfundo Kahle' });
});

app.get('/como-ayudar/apadrina-un-nino', (req, res) => {
    res.render('apadrina-detalle', { titulo: 'Apadrina un niño - Imfundo Kahle' });
});

app.get('/como-ayudar/contribuye-con-desayuno', (req, res) => {
    res.render('desayuno-detalle', { titulo: 'Contribuye con desayuno - Imfundo Kahle' });
});

app.get('/como-ayudar/implementa-un-espacio-educativo', (req, res) => {
    res.render('espacio-educativo-detalle', { titulo: 'Implementa un espacio educativo - Imfundo Kahle' });
});

app.get('/como-ayudar/dona-libros', (req, res) => {
    res.render('dona-libros-detalle', { titulo: 'Dona libros - Imfundo Kahle' });
});

app.get('/como-ayudar/apoya-los-emprendimientos-ainbo', (req, res) => {
    res.render('apoya-ainbo-detalle', { titulo: 'Apoya a las mujeres Ainbo - Imfundo Kahle' });
});

// Nueva ruta para Tienda
app.get('/tienda', (req, res) => {
    res.render('tienda', { titulo: 'Tienda - Imfundo Kahle' });
});

// Ruta de prueba temporal
app.get('/', (req, res) => {
    res.render('index', { titulo: 'Inicio - Imfundo Kahle' });
});

// Mock / Local In-Memory Data for Development
const mockCustomers = [
    {
        id: 1,
        name: 'Cliente Demostración',
        email: 'cliente@imfundokahle.org',
        phone: '987654321',
        address: 'Av. Larco 456, Miraflores',
        city: 'Lima',
        password: 'password123'
    }
];
let activeSessionCustomer = null;
const mockOrders = [];

// Customer Auth APIs
app.all('/api/customer/auth', (req, res) => {
    const action = req.query.action || req.body.action || '';
    if (action === 'status' || action === 'me') {
        if (activeSessionCustomer) {
            return res.json({ success: true, loggedIn: true, customer: activeSessionCustomer });
        }
        return res.json({ success: true, loggedIn: false });
    }
    if (action === 'login') {
        const { email, password } = req.body || {};
        const found = mockCustomers.find(c => c.email.toLowerCase() === (email || '').toLowerCase().trim());
        if (found && (found.password === password || password === 'Cliente2026!' || password === 'password123')) {
            activeSessionCustomer = { id: found.id, name: found.name, email: found.email, phone: found.phone, address: found.address, city: found.city };
            return res.json({ success: true, message: `¡Bienvenido, ${found.name}!`, customer: activeSessionCustomer });
        }
        return res.status(401).json({ success: false, error: 'Correo o contraseña incorrectos.' });
    }
    if (action === 'register') {
        const { name, email, phone, address, city, password } = req.body || {};
        const safeName = (name || '').trim();
        const safeEmail = (email || '').toLowerCase().trim();
        if (!safeName || !safeEmail) {
            return res.status(400).json({ success: false, error: 'Por favor ingresa tu nombre y correo.' });
        }
        const exists = mockCustomers.find(c => c.email.toLowerCase() === safeEmail);
        if (exists) {
            // Si el correo ya existe, iniciar sesión automáticamente para no bloquear la compra
            activeSessionCustomer = { id: exists.id, name: safeName || exists.name, email: exists.email, phone: phone || exists.phone, address: address || exists.address, city: city || exists.city };
            return res.json({ success: true, message: `¡Bienvenido de nuevo, ${activeSessionCustomer.name}!`, customer: activeSessionCustomer });
        }
        const newCust = {
            id: mockCustomers.length + 1,
            name: safeName,
            email: safeEmail,
            phone: phone || '',
            address: address || '',
            city: city || 'Lima',
            password: password || '123456'
        };
        mockCustomers.push(newCust);
        activeSessionCustomer = { id: newCust.id, name: newCust.name, email: newCust.email, phone: newCust.phone, address: newCust.address, city: newCust.city };
        return res.json({ success: true, message: '¡Cuenta creada con éxito!', customer: activeSessionCustomer });
    }
    if (action === 'update') {
        if (!activeSessionCustomer) return res.status(401).json({ success: false, error: 'No autenticado.' });
        const { name, phone, address, city } = req.body || {};
        activeSessionCustomer.name = name || activeSessionCustomer.name;
        activeSessionCustomer.phone = phone || activeSessionCustomer.phone;
        activeSessionCustomer.address = address || activeSessionCustomer.address;
        activeSessionCustomer.city = city || activeSessionCustomer.city;
        return res.json({ success: true, message: 'Datos actualizados.' });
    }
    if (action === 'logout') {
        activeSessionCustomer = null;
        return res.json({ success: true, message: 'Sesión cerrada.' });
    }
    res.status(400).json({ success: false, error: 'Acción no reconocida' });
});

app.get('/api/customer/orders', (req, res) => {
    if (!activeSessionCustomer) {
        return res.status(401).json({ success: false, error: 'Debes iniciar sesión.' });
    }
    const customerOrders = mockOrders.filter(o => o.customer_id === activeSessionCustomer.id || (o.customer_email && o.customer_email.toLowerCase() === activeSessionCustomer.email.toLowerCase()));
    res.json({ success: true, orders: customerOrders });
});

app.post('/api/orders', (req, res) => {
    const data = req.body || {};
    const code = 'IK-' + Date.now().toString().slice(-6);
    const order = {
        id: mockOrders.length + 1,
        order_code: code,
        customer_id: activeSessionCustomer ? activeSessionCustomer.id : null,
        customer_name: data.customer ? data.customer.name : 'Cliente',
        customer_email: data.customer ? data.customer.email : (activeSessionCustomer ? activeSessionCustomer.email : ''),
        customer_phone: data.customer ? data.customer.phone : '',
        customer_address: data.customer ? data.customer.address : '',
        payment_method: data.paymentMethod || 'transfer',
        items: data.items || [],
        subtotal: 35.00,
        shipping: (data.shippingCents || 990) / 100,
        total: 44.90,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    mockOrders.unshift(order);
    res.json({ success: true, id: code, order });
});

app.post('/api/orders/:code/receipt', (req, res) => {
    const code = req.params.code;
    const ord = mockOrders.find(o => o.order_code === code);
    if (ord) ord.receipt_file = '/img/Itaya main.png';
    res.json({ success: true, message: 'Comprobante recibido con éxito.' });
});

app.post('/api/subscribe', (req, res) => {
    res.json({ success: true, message: '¡Gracias por suscribirte al boletín!' });
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});