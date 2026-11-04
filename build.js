const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');
const viewsDir = path.join(__dirname, 'views');

// Lista de páginas y sus metadatos
const pages = [
    {
        view: 'index.ejs',
        title: 'Inicio - Imfundo Kahle',
        file: 'index.html',
        aliases: []
    },
    {
        view: 'nosotros.ejs',
        title: 'Sobre nosotros - Imfundo Kahle',
        file: 'nosotros.html',
        aliases: ['nosotros/index.html']
    },
    {
        view: 'proyectos.ejs',
        title: 'Nuestros proyectos - Imfundo Kahle',
        file: 'proyectos.html',
        aliases: ['proyectos/index.html']
    },
    {
        view: 'casa-ainbo.ejs',
        title: 'Casa Ainbo - Imfundo Kahle',
        file: 'casa-ainbo.html',
        aliases: ['proyectos/casa-ainbo.html', 'proyectos/casa-ainbo/index.html']
    },
    {
        view: 'sonrisas-de-navidad.ejs',
        title: 'Sonrisas de Navidad - Imfundo Kahle',
        file: 'sonrisas-de-navidad.html',
        aliases: ['proyectos/sonrisas-de-navidad.html', 'proyectos/sonrisas-de-navidad/index.html']
    },
    {
        view: 'guardianes-itaya.ejs',
        title: 'Guardianes del Itaya - Imfundo Kahle',
        file: 'guardianes-del-itaya.html',
        aliases: ['proyectos/guardianes-del-itaya.html', 'proyectos/guardianes-del-itaya/index.html']
    },
    {
        view: 'imfundo-yoga.ejs',
        title: 'Imfundo Yoga - Imfundo Kahle',
        file: 'imfundo-yoga.html',
        aliases: ['proyectos/imfundo-yoga.html', 'proyectos/imfundo-yoga/index.html']
    },
    {
        view: 'languages-for-hope.ejs',
        title: 'Languages for Hope - Imfundo Kahle',
        file: 'languages-for-hope.html',
        aliases: ['proyectos/languages-for-hope.html', 'proyectos/languages-for-hope/index.html']
    },
    {
        view: 'proyecto-butterfly.ejs',
        title: 'Proyecto Butterfly - Imfundo Kahle',
        file: 'proyecto-butterfly.html',
        aliases: ['proyectos/proyecto-butterfly.html', 'proyectos/proyecto-butterfly/index.html']
    },
    {
        view: 'ainbo.ejs',
        title: 'Proyecto Ainbo - Imfundo Kahle',
        file: 'ainbo.html',
        aliases: ['proyectos/ainbo.html', 'proyectos/ainbo/index.html']
    },
    {
        view: 'se-un-voluntario.ejs',
        title: 'Sé un voluntario - Imfundo Kahle',
        file: 'se-un-voluntario.html',
        aliases: ['se-un-voluntario/index.html']
    },
    {
        view: 'voluntario-detalle.ejs',
        title: 'Sé voluntario - Imfundo Kahle',
        file: 'voluntariado.html',
        aliases: ['se-voluntario.html', 'se-un-voluntario/voluntariado.html', 'se-un-voluntario/voluntariado/index.html']
    },
    {
        view: 'apadrina-detalle.ejs',
        title: 'Apadrina un niño - Imfundo Kahle',
        file: 'apadrina-un-nino.html',
        aliases: ['se-un-voluntario/apadrina-un-nino.html', 'se-un-voluntario/apadrina-un-nino/index.html']
    },
    {
        view: 'desayuno-detalle.ejs',
        title: 'Contribuye con desayuno - Imfundo Kahle',
        file: 'contribuye-con-desayuno.html',
        aliases: ['se-un-voluntario/contribuye-con-desayuno.html', 'se-un-voluntario/contribuye-con-desayuno/index.html']
    },
    {
        view: 'como-ayudar.ejs',
        title: 'Cómo ayudar - Imfundo Kahle',
        file: 'como-ayudar.html',
        aliases: ['como-ayudar/index.html']
    }
];

// Función para copiar directorios recursivamente
function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Función para transformar los enlaces absolutos en relativos para abrir como HTML
function transformLinks(html, depth = 0) {
    const prefix = depth === 0 ? '' : '../'.repeat(depth);

    // Mapeo de rutas
    let transformed = html;

    // Enlaces de navegación y páginas
    const linkReplacements = [
        // Subrutas de Sé un voluntario
        { from: /href="\/se-un-voluntario\/voluntariado"/g, to: `href="${prefix}voluntariado.html"` },
        { from: /href="\/se-voluntario"/g, to: `href="${prefix}voluntariado.html"` },
        { from: /href="\/se-un-voluntario\/apadrina-un-nino"/g, to: `href="${prefix}apadrina-un-nino.html"` },
        { from: /href="\/apadrina-un-nino"/g, to: `href="${prefix}apadrina-un-nino.html"` },
        { from: /href="\/se-un-voluntario\/contribuye-con-desayuno"/g, to: `href="${prefix}contribuye-con-desayuno.html"` },
        { from: /href="\/contribuye-con-desayuno"/g, to: `href="${prefix}contribuye-con-desayuno.html"` },
        { from: /href="\/se-un-voluntario"/g, to: `href="${prefix}se-un-voluntario.html"` },

        // Subrutas de Proyectos
        { from: /href="\/proyectos\/casa-ainbo"/g, to: `href="${prefix}casa-ainbo.html"` },
        { from: /href="\/proyectos\/sonrisas-de-navidad"/g, to: `href="${prefix}sonrisas-de-navidad.html"` },
        { from: /href="\/proyectos\/guardianes-del-itaya"/g, to: `href="${prefix}guardianes-del-itaya.html"` },
        { from: /href="\/proyectos\/imfundo-yoga"/g, to: `href="${prefix}imfundo-yoga.html"` },
        { from: /href="\/proyectos\/languages-for-hope"/g, to: `href="${prefix}languages-for-hope.html"` },
        { from: /href="\/proyectos\/proyecto-butterfly"/g, to: `href="${prefix}proyecto-butterfly.html"` },
        { from: /href="\/proyectos\/ainbo"/g, to: `href="${prefix}ainbo.html"` },
        { from: /href="\/proyectos"/g, to: `href="${prefix}proyectos.html"` },

        // Nosotros y Cómo ayudar
        { from: /href="\/nosotros#/g, to: `href="${prefix}nosotros.html#` },
        { from: /href="\/nosotros"/g, to: `href="${prefix}nosotros.html"` },
        { from: /href="\/como-ayudar#/g, to: `href="${prefix}como-ayudar.html#` },
        { from: /href="\/como-ayudar"/g, to: `href="${prefix}como-ayudar.html"` },

        // Home
        { from: /href="\/(#.+?)"/g, to: `href="${prefix}index.html$1"` },
        { from: /href="\/"/g, to: `href="${prefix}index.html"` },

        // Assets estáticos (CSS, JS, IMG)
        { from: /href="\/css\//g, to: `href="${prefix}css/` },
        { from: /src="\/js\//g, to: `src="${prefix}js/` },
        { from: /src="\/img\//g, to: `src="${prefix}img/` }
    ];

    for (let r of linkReplacements) {
        transformed = transformed.replace(r.from, r.to);
    }

    return transformed;
}

// 1. Limpiar o crear dist
console.log('--- Iniciando generación de proyecto HTML estático ---');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Copiar assets estáticos (public -> dist)
console.log('Copiando carpetas de assets (css, img, js)...');
copyDirSync(publicDir, distDir);

// 3. Renderizar cada página
console.log('Renderizando vistas EJS a HTML estático...');
for (let page of pages) {
    const viewPath = path.join(viewsDir, page.view);
    if (!fs.existsSync(viewPath)) {
        console.warn(`Vista no encontrada: ${page.view}`);
        continue;
    }

    const template = fs.readFileSync(viewPath, 'utf8');
    const rawHtml = ejs.render(template, { titulo: page.title }, { filename: viewPath });

    // Versión raíz (depth 0)
    const rootHtml = transformLinks(rawHtml, 0);
    const destPath = path.join(distDir, page.file);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, rootHtml, 'utf8');
    console.log(`✓ Generado: dist/${page.file}`);

    // Alias / carpetas adicionales si existen
    for (let alias of page.aliases) {
        const aliasDepth = alias.split('/').length - 1;
        const aliasHtml = transformLinks(rawHtml, aliasDepth);
        const aliasPath = path.join(distDir, alias);
        fs.mkdirSync(path.dirname(aliasPath), { recursive: true });
        fs.writeFileSync(aliasPath, aliasHtml, 'utf8');
        console.log(`  └─ Alias: dist/${alias}`);
    }
}

console.log('\n¡Proyecto HTML estático generado con éxito en la carpeta /dist!');
console.log('Puedes abrir directamente dist/index.html en cualquier navegador.');
