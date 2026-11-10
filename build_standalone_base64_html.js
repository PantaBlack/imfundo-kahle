const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const rootDir = __dirname;
const viewsDir = path.join(rootDir, 'views');
const publicDir = path.join(rootDir, 'public');
const imgDir = path.join(publicDir, 'img');
const cssDir = path.join(publicDir, 'css');

// Cache en memoria para Base64
const memoryCache = new Map();

function getBase64Uri(rawName) {
    if (!rawName) return '';
    const clean = rawName.split('?')[0].trim();
    const decoded = decodeURIComponent(clean);

    if (memoryCache.has(decoded)) {
        return memoryCache.get(decoded);
    }

    // Buscar archivo en public/img
    let targetPath = path.join(imgDir, decoded);
    if (!fs.existsSync(targetPath)) {
        // Intento case-insensitive
        const allFiles = fs.readdirSync(imgDir);
        const found = allFiles.find(f => f.toLowerCase() === decoded.toLowerCase());
        if (found) {
            targetPath = path.join(imgDir, found);
        }
    }

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
        const ext = path.extname(targetPath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';
        const buffer = fs.readFileSync(targetPath);
        const uri = `data:${mime};base64,${buffer.toString('base64')}`;
        memoryCache.set(decoded, uri);
        memoryCache.set(rawName, uri);
        return uri;
    }

    console.warn('⚠️ Imagen no encontrada en disco:', decoded);
    return `public/img/${clean}`;
}

function replaceImagesWithBase64(text) {
    let result = text;
    // 1. Reemplazar src="..." y data-news-image="..."
    result = result.replace(/(src|data-news-image)=["'](?:(?:\/|public\/)?img\/)([^"']+)["']/g, (m, attr, imgName) => {
        const uri = getBase64Uri(imgName);
        return `${attr}="${uri}"`;
    });

    // 2. Reemplazar url(...) en CSS
    result = result.replace(/url\(['"]?(?:(?:\/|public\/)?img\/)([^'")]+)['"]?\)/g, (m, imgName) => {
        const uri = getBase64Uri(imgName);
        return `url('${uri}')`;
    });

    // 3. Reemplazar rutas de tienda en JS
    result = result.replace(/(["'])(?:\/|public\/)?img\/(tienda\/[^"']+)(["'])/g, (m, q1, imgName, q2) => {
        const uri = getBase64Uri(imgName);
        return `${q1}${uri}${q2}`;
    });

    return result;
}

// Lista completa de las 15 páginas con sus IDs y títulos
const pageConfigs = [
    { id: 'inicio', view: 'index.ejs', title: 'Inicio - Imfundo Kahle', label: '🏠 Inicio' },
    { id: 'nosotros', view: 'nosotros.ejs', title: 'Sobre nosotros - Imfundo Kahle', label: '👥 Sobre nosotros' },
    { id: 'proyectos', view: 'proyectos.ejs', title: 'Nuestros proyectos - Imfundo Kahle', label: '📁 Proyectos (General)' },
    { id: 'casa-ainbo', view: 'casa-ainbo.ejs', title: 'Casa Ainbo - Imfundo Kahle', label: '🏡 Casa Ainbo' },
    { id: 'sonrisas-de-navidad', view: 'sonrisas-de-navidad.ejs', title: 'Sonrisas de Navidad - Imfundo Kahle', label: '🎄 Sonrisas de Navidad' },
    { id: 'guardianes-del-itaya', view: 'guardianes-itaya.ejs', title: 'Guardianes del Itaya - Imfundo Kahle', label: '🌊 Guardianes del Itaya' },
    { id: 'imfundo-yoga', view: 'imfundo-yoga.ejs', title: 'Imfundo Yoga - Imfundo Kahle', label: '🧘 Imfundo Yoga' },
    { id: 'languages-for-hope', view: 'languages-for-hope.ejs', title: 'Languages for Hope - Imfundo Kahle', label: '🌍 Languages for Hope' },
    { id: 'proyecto-butterfly', view: 'proyecto-butterfly.ejs', title: 'Proyecto Butterfly - Imfundo Kahle', label: '🦋 Proyecto Butterfly' },
    { id: 'ainbo', view: 'ainbo.ejs', title: 'Ainbo - Imfundo Kahle', label: '🎨 Ainbo Emprendimientos' },
    { id: 'se-un-voluntario', view: 'se-un-voluntario.ejs', title: 'Sé un voluntario - Imfundo Kahle', label: '🤝 Sé un voluntario (Hub 6 tarjetas)' },
    { id: 'voluntariado', view: 'voluntario-detalle.ejs', title: 'Sé voluntario - Imfundo Kahle', label: '📌 Detalle: Sé voluntario (01)' },
    { id: 'apadrina-un-nino', view: 'apadrina-detalle.ejs', title: 'Apadrina un niño - Imfundo Kahle', label: '📌 Detalle: Apadrina un niño (02)' },
    { id: 'contribuye-con-desayuno', view: 'desayuno-detalle.ejs', title: 'Contribuye con desayuno - Imfundo Kahle', label: '📌 Detalle: Contribuye con desayuno (03)' },
    { id: 'implementa-un-espacio-educativo', view: 'espacio-educativo-detalle.ejs', title: 'Implementa un espacio educativo - Imfundo Kahle', label: '📌 Detalle: Espacio educativo (04)' },
    { id: 'dona-libros', view: 'dona-libros-detalle.ejs', title: 'Dona libros - Imfundo Kahle', label: '📌 Detalle: Dona libros (05)' },
    { id: 'apoya-los-emprendimientos-ainbo', view: 'apoya-ainbo-detalle.ejs', title: 'Apoya a las mujeres Ainbo - Imfundo Kahle', label: '📌 Detalle: Apoya mujeres Ainbo (06)' },
    { id: 'como-ayudar', view: 'como-ayudar.ejs', title: 'Cómo ayudar - Imfundo Kahle', label: '💙 Cómo ayudar' },
    { id: 'tienda', view: 'tienda.ejs', title: 'Tienda - Imfundo Kahle', label: '🛍️ Tienda' }
];

const cssFiles = [
    'style.css', 'nosotros.css', 'proyectos.css', 'casa-ainbo.css', 'sonrisas-de-navidad.css',
    'guardianes-itaya.css', 'imfundo-yoga.css', 'languages-for-hope.css', 'proyecto-butterfly.css',
    'ainbo.css', 'se-un-voluntario.css', 'voluntario-detalle.css', 'apadrina-detalle.css',
    'desayuno-detalle.css', 'espacio-educativo-detalle.css', 'dona-libros-detalle.css', 'apoya-ainbo-detalle.css', 'como-ayudar.css', 'tienda.css'
];

console.log('Concatenando CSS e incrustando imágenes...');
let combinedCss = '';
for (const file of cssFiles) {
    const filePath = path.join(cssDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = replaceImagesWithBase64(content);
        combinedCss += `\n/* === ARCHIVO: ${file} === */\n` + content + '\n';
    }
}

const previewStyles = `
/* === ESTILOS PARA LA VISTA PREVIA Y CONMUTACIÓN DE PÁGINAS === */
.page-view {
    display: none !important;
}
.page-view.active {
    display: block !important;
}

#reviewer-bar {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
    background: #111827;
    color: #ffffff;
    padding: 10px 16px;
    border-radius: 50px;
    box-shadow: 0 12px 35px rgba(0,0,0,0.4), 0 0 0 1.5px rgba(255,255,255,0.18);
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    align-items: center;
    gap: 12px;
    backdrop-filter: blur(12px);
    transition: all 0.25s ease;
}
#reviewer-bar.is-minimized {
    padding: 8px 12px;
    border-radius: 30px;
    background: rgba(17, 24, 39, 0.9);
}
#reviewer-bar.is-minimized .reviewer-content {
    display: none;
}
.reviewer-content {
    display: flex;
    align-items: center;
    gap: 10px;
}
.reviewer-title {
    font-size: 13px;
    font-weight: 700;
    color: #f87171;
    letter-spacing: 0.3px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
}
.reviewer-select {
    background: #1f2937;
    color: #ffffff;
    border: 1px solid #4b5563;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    outline: none;
    max-width: 270px;
}
.reviewer-select:focus {
    border-color: #e2583e;
}
.reviewer-toggle {
    background: #374151;
    border: none;
    color: #f3f4f6;
    cursor: pointer;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    border-radius: 50%;
    transition: background 0.2s, color 0.2s;
}
.reviewer-toggle:hover {
    background: #4b5563;
    color: #ffffff;
}
`;

const indexEjsPath = path.join(viewsDir, 'index.ejs');
const indexContent = fs.readFileSync(indexEjsPath, 'utf8');
const renderedIndex = ejs.render(indexContent, { titulo: 'Inicio - Imfundo Kahle' }, { filename: indexEjsPath });

const headerMatch = renderedIndex.match(/<header class="site-header">[\s\S]*?<\/header>/);
let globalHeader = headerMatch ? headerMatch[0] : '';
globalHeader = replaceImagesWithBase64(globalHeader);
globalHeader = globalHeader.replace(/href="\/"/g, `href="#inicio"`);

const footerMatch = renderedIndex.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
let globalFooter = footerMatch ? footerMatch[0] : '';
globalFooter = replaceImagesWithBase64(globalFooter);
globalFooter = globalFooter.replace(/href="\/"/g, `href="#inicio"`);

console.log('Procesando e incrustando vistas en Base64...');
const pageViewsHtml = [];

for (const page of pageConfigs) {
    const viewPath = path.join(viewsDir, page.view);
    if (!fs.existsSync(viewPath)) continue;

    const template = fs.readFileSync(viewPath, 'utf8');
    const rendered = ejs.render(template, { titulo: page.title }, { filename: viewPath });

    const mainMatch = rendered.match(/<main([\s\S]*?)>([\s\S]*?)<\/main>/);
    let mainTagAttrs = '';
    let mainInner = '';

    if (mainMatch) {
        mainTagAttrs = mainMatch[1];
        mainInner = mainMatch[2];
    } else {
        const bodyMatch = rendered.match(/<body>([\s\S]*?)<\/body>/);
        mainInner = bodyMatch ? bodyMatch[1] : rendered;
    }

    mainInner = replaceImagesWithBase64(mainInner);
    mainInner = mainInner.replace(/loading="lazy"/g, 'loading="eager"');

    const isActive = page.id === 'inicio' ? 'active' : '';
    pageViewsHtml.push(`
    <!-- ========================================== -->
    <!-- VISTA: ${page.title} (ID: ${page.id}) -->
    <!-- ========================================== -->
    <div class="page-view ${isActive}" id="view-${page.id}" data-page="${page.id}" data-title="${page.title}">
        <main ${mainTagAttrs}>
            ${mainInner}
        </main>
    </div>`);
}

const selectOptions = pageConfigs.map(p => 
    `<option value="${p.id}" ${p.id === 'inicio' ? 'selected' : ''}>${p.label}</option>`
).join('\n                    ');

const routerScript = `
<script>
(function() {
    const pageViews = document.querySelectorAll('.page-view');
    const reviewerSelect = document.getElementById('reviewer-page-select');
    const reviewerBar = document.getElementById('reviewer-bar');
    const reviewerToggle = document.getElementById('reviewer-toggle');

    const routeMap = {
        '': 'inicio', '/': 'inicio', '#inicio': 'inicio', 'index.html': 'inicio',
        '/nosotros': 'nosotros', 'nosotros.html': 'nosotros', '#nosotros': 'nosotros',
        '/proyectos': 'proyectos', 'proyectos.html': 'proyectos', '#proyectos': 'proyectos',
        '/proyectos/casa-ainbo': 'casa-ainbo', 'casa-ainbo.html': 'casa-ainbo', '#casa-ainbo': 'casa-ainbo',
        '/proyectos/sonrisas-de-navidad': 'sonrisas-de-navidad', 'sonrisas-de-navidad.html': 'sonrisas-de-navidad', '#sonrisas-de-navidad': 'sonrisas-de-navidad',
        '/proyectos/guardianes-del-itaya': 'guardianes-del-itaya', 'guardianes-del-itaya.html': 'guardianes-del-itaya', '#guardianes-del-itaya': 'guardianes-del-itaya',
        '/proyectos/imfundo-yoga': 'imfundo-yoga', 'imfundo-yoga.html': 'imfundo-yoga', '#imfundo-yoga': 'imfundo-yoga',
        '/proyectos/languages-for-hope': 'languages-for-hope', 'languages-for-hope.html': 'languages-for-hope', '#languages-for-hope': 'languages-for-hope',
        '/proyectos/proyecto-butterfly': 'proyecto-butterfly', 'proyecto-butterfly.html': 'proyecto-butterfly', '#proyecto-butterfly': 'proyecto-butterfly',
        '/proyectos/ainbo': 'ainbo', 'ainbo.html': 'ainbo', '#ainbo': 'ainbo',
        '/se-un-voluntario': 'se-un-voluntario', 'se-un-voluntario.html': 'se-un-voluntario', '#se-un-voluntario': 'se-un-voluntario',
        '/se-un-voluntario/voluntariado': 'voluntariado', '/se-voluntario': 'voluntariado', 'voluntariado.html': 'voluntariado', 'se-voluntario.html': 'voluntariado', '#voluntariado': 'voluntariado', '#se-voluntario': 'voluntariado',
        '/se-un-voluntario/apadrina-un-nino': 'apadrina-un-nino', '/apadrina-un-nino': 'apadrina-un-nino', 'apadrina-un-nino.html': 'apadrina-un-nino', '#apadrina-un-nino': 'apadrina-un-nino', '#apadrinamiento': 'apadrina-un-nino',
        '/se-un-voluntario/contribuye-con-desayuno': 'contribuye-con-desayuno', '/contribuye-con-desayuno': 'contribuye-con-desayuno', 'contribuye-con-desayuno.html': 'contribuye-con-desayuno', '#contribuye-con-desayuno': 'contribuye-con-desayuno',
        '/se-un-voluntario/implementa-un-espacio-educativo': 'implementa-un-espacio-educativo', '/implementa-un-espacio-educativo': 'implementa-un-espacio-educativo', 'implementa-un-espacio-educativo.html': 'implementa-un-espacio-educativo', '#implementa-un-espacio-educativo': 'implementa-un-espacio-educativo',
        '/se-un-voluntario/dona-libros': 'dona-libros', '/dona-libros': 'dona-libros', 'dona-libros.html': 'dona-libros', '#dona-libros': 'dona-libros',
        '/se-un-voluntario/apoya-los-emprendimientos-ainbo': 'apoya-los-emprendimientos-ainbo', '/apoya-los-emprendimientos-ainbo': 'apoya-los-emprendimientos-ainbo', 'apoya-los-emprendimientos-ainbo.html': 'apoya-los-emprendimientos-ainbo', '/se-un-voluntario/apoya-ainbo': 'apoya-los-emprendimientos-ainbo', '/apoya-ainbo': 'apoya-los-emprendimientos-ainbo', 'apoya-ainbo.html': 'apoya-los-emprendimientos-ainbo', '#apoya-ainbo': 'apoya-los-emprendimientos-ainbo', '#apoya-los-emprendimientos-ainbo': 'apoya-los-emprendimientos-ainbo',
        '/como-ayudar': 'como-ayudar', 'como-ayudar.html': 'como-ayudar', '#como-ayudar': 'como-ayudar',
        '/tienda': 'tienda', 'tienda.html': 'tienda', '#tienda': 'tienda'
    };

    function switchView(targetId, targetAnchor) {
        document.body.classList.remove('scroll-locked', 'detail-open', 'settings-open', 'cart-main-open', 'checkout-open');
        document.documentElement.classList.remove('scroll-locked', 'detail-open', 'settings-open', 'cart-main-open', 'checkout-open');
        let activeView = null;
        pageViews.forEach(view => {
            if (view.dataset.page === targetId) {
                view.classList.add('active');
                activeView = view;
                document.title = view.dataset.title || 'Imfundo Kahle';
            } else {
                view.classList.remove('active');
            }
        });

        if (reviewerSelect) {
            reviewerSelect.value = targetId;
        }

        document.querySelectorAll('.site-nav a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && routeMap[href] === targetId) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        if (targetAnchor) {
            setTimeout(() => {
                const el = document.getElementById(targetAnchor) || document.querySelector(targetAnchor);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 50);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
            return;
        }

        const parts = href.split('#');
        const pathPart = parts[0];
        const anchorPart = parts[1];

        if (!pathPart && anchorPart) {
            if (anchorPart === 'quienes-somos' || anchorPart === 'equipo' || anchorPart === 'reconocimientos' || anchorPart === 'memorias') {
                e.preventDefault();
                switchView('nosotros', anchorPart);
                return;
            }
            if (anchorPart === 'inicio' || anchorPart === 'noticias' || anchorPart === 'boletines' || anchorPart === 'campanas') {
                e.preventDefault();
                switchView('inicio', anchorPart);
                return;
            }
            if (anchorPart === 'apadrinamiento' || anchorPart === 'apadrina-un-nino') {
                e.preventDefault();
                switchView('apadrina-un-nino');
                return;
            }
            if (anchorPart === 'donar') {
                e.preventDefault();
                switchView('como-ayudar', 'donar');
                return;
            }
            return;
        }

        const targetId = routeMap[pathPart] || routeMap[href];
        if (targetId) {
            e.preventDefault();
            switchView(targetId, anchorPart);
        }
    });

    reviewerSelect?.addEventListener('change', function(e) {
        switchView(e.target.value);
    });

    reviewerToggle?.addEventListener('click', function() {
        reviewerBar?.classList.toggle('is-minimized');
        const isMin = reviewerBar?.classList.contains('is-minimized');
        reviewerToggle.textContent = isMin ? '👁' : '✕';
    });

    if (window.location.hash) {
        const hash = window.location.hash;
        const targetId = routeMap[hash] || (hash === '#nosotros' ? 'nosotros' : hash === '#se-un-voluntario' ? 'se-un-voluntario' : null);
        if (targetId) {
            switchView(targetId);
        }
    }
})();
</script>
`;

const mainJsPath = path.join(publicDir, 'js', 'main.js');
let siteJs = '';
if (fs.existsSync(mainJsPath)) {
    siteJs = fs.readFileSync(mainJsPath, 'utf8');
    siteJs = siteJs.replace("card.dataset.newsImage === '/img/chino.jpeg'", "card.dataset.newsTitle.includes('Se-I Kang')");
}

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#ffffff">
    <meta name="description" content="Imfundo Kahle - Sitio Completo Standalone con todas las imágenes incrustadas.">
    <title>Imfundo Kahle - Sitio Completo (Revisión)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    <style>
${combinedCss}
${previewStyles}
    </style>
</head>
<body>

    <aside id="reviewer-bar" aria-label="Selector de vistas">
        <div class="reviewer-content">
            <span class="reviewer-title">👁 Vista Previa:</span>
            <select class="reviewer-select" id="reviewer-page-select" aria-label="Cambiar de página">
                ${selectOptions}
            </select>
        </div>
        <button class="reviewer-toggle" id="reviewer-toggle" type="button" title="Minimizar barra">✕</button>
    </aside>

    ${globalHeader}

    <div id="pages-container">
        ${pageViewsHtml.join('\n')}
    </div>

    ${globalFooter}

    <script>
${siteJs}
    </script>
    ${routerScript}

</body>
</html>
`;

const outPresentationPath = path.join(rootDir, 'imfundo_kahle_presentacion.html');
fs.writeFileSync(outPresentationPath, fullHtml, 'utf8');
console.log(`✓ Generado con éxito: ${outPresentationPath} (${(fullHtml.length / (1024 * 1024)).toFixed(2)} MB)`);
