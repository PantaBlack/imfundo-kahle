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
    res.render('se-un-voluntario', { titulo: 'Sé un voluntario - Imfundo Kahle' });
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

// Nueva ruta para Cómo ayudar
app.get('/como-ayudar', (req, res) => {
    res.render('como-ayudar', { titulo: 'Cómo ayudar - Imfundo Kahle' });
});

// Ruta de prueba temporal
app.get('/', (req, res) => {
    res.render('index', { titulo: 'Inicio - Imfundo Kahle' });
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});