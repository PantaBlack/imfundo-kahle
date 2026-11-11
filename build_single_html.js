const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const rootDir = __dirname;
const viewsDir = path.join(rootDir, 'views');
const publicDir = path.join(rootDir, 'public');
const cssDir = path.join(publicDir, 'css');

// Lista completa de las 15 páginas con sus IDs y títulos
const pageConfigs = [
    {
        id: 'inicio',
        view: 'index.ejs',
        title: 'Inicio - Imfundo Kahle',
        label: '🏠 Inicio',
        navMatch: ['/', '/#inicio', '#inicio', 'index.html']
    },
    {
        id: 'nosotros',
        view: 'nosotros.ejs',
        title: 'Sobre nosotros - Imfundo Kahle',
        label: '👥 Sobre nosotros',
        navMatch: ['/nosotros', 'nosotros.html']
    },
    {
        id: 'proyectos',
        view: 'proyectos.ejs',
        title: 'Nuestros proyectos - Imfundo Kahle',
        label: '📁 Proyectos (General)',
        navMatch: ['/proyectos', 'proyectos.html']
    },
    {
        id: 'casa-ainbo',
        view: 'casa-ainbo.ejs',
        title: 'Casa Ainbo - Imfundo Kahle',
        label: '🏡 Casa Ainbo',
        navMatch: ['/proyectos/casa-ainbo', 'casa-ainbo.html']
    },
    {
        id: 'sonrisas-de-navidad',
        view: 'sonrisas-de-navidad.ejs',
        title: 'Sonrisas de Navidad - Imfundo Kahle',
        label: '🎄 Sonrisas de Navidad',
        navMatch: ['/proyectos/sonrisas-de-navidad', 'sonrisas-de-navidad.html']
    },
    {
        id: 'guardianes-del-itaya',
        view: 'guardianes-itaya.ejs',
        title: 'Guardianes del Itaya - Imfundo Kahle',
        label: '🌊 Guardianes del Itaya',
        navMatch: ['/proyectos/guardianes-del-itaya', 'guardianes-del-itaya.html']
    },
    {
        id: 'imfundo-yoga',
        view: 'imfundo-yoga.ejs',
        title: 'Imfundo Yoga - Imfundo Kahle',
        label: '🧘 Imfundo Yoga',
        navMatch: ['/proyectos/imfundo-yoga', 'imfundo-yoga.html']
    },
    {
        id: 'languages-for-hope',
        view: 'languages-for-hope.ejs',
        title: 'Languages for Hope - Imfundo Kahle',
        label: '🌍 Languages for Hope',
        navMatch: ['/proyectos/languages-for-hope', 'languages-for-hope.html']
    },
    {
        id: 'proyecto-butterfly',
        view: 'proyecto-butterfly.ejs',
        title: 'Proyecto Butterfly - Imfundo Kahle',
        label: '🦋 Proyecto Butterfly',
        navMatch: ['/proyectos/proyecto-butterfly', 'proyecto-butterfly.html']
    },
    {
        id: 'ainbo',
        view: 'ainbo.ejs',
        title: 'Ainbo - Imfundo Kahle',
        label: '🎨 Ainbo Emprendimientos',
        navMatch: ['/proyectos/ainbo', 'ainbo.html']
    },
    {
        id: 'se-un-voluntario',
        view: 'se-un-voluntario.ejs',
        title: 'Sé un voluntario - Imfundo Kahle',
        label: '🤝 Sé un voluntario (Hub 6 tarjetas)',
        navMatch: ['/se-un-voluntario', 'se-un-voluntario.html']
    },
    {
        id: 'voluntariado',
        view: 'voluntario-detalle.ejs',
        title: 'Sé voluntario - Imfundo Kahle',
        label: '📌 Detalle: Sé voluntario (01)',
        navMatch: ['/se-un-voluntario/voluntariado', '/se-voluntario', 'voluntariado.html', 'se-voluntario.html']
    },
    {
        id: 'apadrina-un-nino',
        view: 'apadrina-detalle.ejs',
        title: 'Apadrina un niño - Imfundo Kahle',
        label: '📌 Detalle: Apadrina un niño (02)',
        navMatch: ['/se-un-voluntario/apadrina-un-nino', '/apadrina-un-nino', 'apadrina-un-nino.html']
    },
    {
        id: 'contribuye-con-desayuno',
        view: 'desayuno-detalle.ejs',
        title: 'Contribuye con desayuno - Imfundo Kahle',
        label: '📌 Detalle: Contribuye con desayuno (03)',
        navMatch: ['/se-un-voluntario/contribuye-con-desayuno', '/contribuye-con-desayuno', 'contribuye-con-desayuno.html']
    },
    {
        id: 'implementa-un-espacio-educativo',
        view: 'espacio-educativo-detalle.ejs',
        title: 'Implementa un espacio educativo - Imfundo Kahle',
        label: '📌 Detalle: Espacio educativo (04)',
        navMatch: ['/se-un-voluntario/implementa-un-espacio-educativo', '/implementa-un-espacio-educativo', 'implementa-un-espacio-educativo.html']
    },
    {
        id: 'dona-libros',
        view: 'dona-libros-detalle.ejs',
        title: 'Dona libros - Imfundo Kahle',
        label: '📌 Detalle: Dona libros (05)',
        navMatch: ['/se-un-voluntario/dona-libros', '/dona-libros', 'dona-libros.html']
    },
    {
        id: 'apoya-los-emprendimientos-ainbo',
        view: 'apoya-ainbo-detalle.ejs',
        title: 'Apoya a las mujeres Ainbo - Imfundo Kahle',
        label: '📌 Detalle: Apoya mujeres Ainbo (06)',
        navMatch: ['/se-un-voluntario/apoya-los-emprendimientos-ainbo', '/apoya-los-emprendimientos-ainbo', 'apoya-los-emprendimientos-ainbo.html', '/se-un-voluntario/apoya-ainbo', '/apoya-ainbo', 'apoya-ainbo.html']
    },
    {
        id: 'como-ayudar',
        view: 'como-ayudar.ejs',
        title: 'Cómo ayudar - Imfundo Kahle',
        label: '💙 Cómo ayudar',
        navMatch: ['/como-ayudar', 'como-ayudar.html', '/donar', 'donar.html']
    },
    {
        id: 'tienda',
        view: 'tienda.ejs',
        title: 'Tienda - Imfundo Kahle',
        label: '🛍️ Tienda',
        navMatch: ['/tienda', 'tienda.html']
    }
];

// CSS a incluir en orden
const cssFiles = [
    'style.css',
    'nosotros.css',
    'proyectos.css',
    'casa-ainbo.css',
    'sonrisas-de-navidad.css',
    'guardianes-itaya.css',
    'imfundo-yoga.css',
    'languages-for-hope.css',
    'proyecto-butterfly.css',
    'ainbo.css',
    'se-un-voluntario.css',
    'voluntario-detalle.css',
    'apadrina-detalle.css',
    'desayuno-detalle.css',
    'espacio-educativo-detalle.css',
    'dona-libros-detalle.css',
    'apoya-ainbo-detalle.css',
    'como-ayudar.css',
    'tienda.css'
];

function build(isDist = false) {
    const imgPrefix = isDist ? 'img/' : 'public/img/';
    
    // 1. Cargar y concatenar CSS
    let combinedCss = '';
    for (const file of cssFiles) {
        const filePath = path.join(cssDir, file);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Corregir rutas de imágenes en el CSS
            content = content.replace(/url\(['"]?\/img\//g, `url('${imgPrefix}`);
            combinedCss += `\n/* === ARCHIVO: ${file} === */\n` + content + '\n';
        }
    }

    // Estilos extra para la barra de revisión y control de vistas
    const previewStyles = `
/* === ESTILOS PARA LA VISTA PREVIA Y CONMUTACIÓN DE PÁGINAS === */
.page-view {
    display: none !important;
}
.page-view.active {
    display: block !important;
}

/* Barra flotante de revisión rápida */
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

    // 2. Extraer el header del index.ejs para usarlo globalmente
    const indexEjsPath = path.join(viewsDir, 'index.ejs');
    const indexContent = fs.readFileSync(indexEjsPath, 'utf8');
    const renderedIndex = ejs.render(indexContent, { titulo: 'Inicio - Imfundo Kahle' }, { filename: indexEjsPath });
    
    // Extraer <header class="site-header">...</header>
    const headerMatch = renderedIndex.match(/<header class="site-header">[\s\S]*?<\/header>/);
    let globalHeader = headerMatch ? headerMatch[0] : '';
    // Corregir imágenes en el header si las hubiera
    globalHeader = globalHeader.replace(/src="\/img\//g, `src="${imgPrefix}`);
    globalHeader = globalHeader.replace(/href="\/"/g, `href="#inicio"`);

    // Extraer footer
    const footerMatch = renderedIndex.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
    let globalFooter = footerMatch ? footerMatch[0] : '';
    globalFooter = globalFooter.replace(/src="\/img\//g, `src="${imgPrefix}`);
    globalFooter = globalFooter.replace(/href="\/"/g, `href="#inicio"`);

    // 3. Renderizar y extraer el contenido de cada página (<main>...</main> o contenido interno)
    const pageViewsHtml = [];

    for (const page of pageConfigs) {
        const viewPath = path.join(viewsDir, page.view);
        if (!fs.existsSync(viewPath)) {
            console.warn(`Vista no encontrada: ${page.view}`);
            continue;
        }

        const template = fs.readFileSync(viewPath, 'utf8');
        const rendered = ejs.render(template, { titulo: page.title }, { filename: viewPath });

        // Extraer <main ...>...</main>
        const mainMatch = rendered.match(/<main([\s\S]*?)>([\s\S]*?)<\/main>/);
        let mainTagAttrs = '';
        let mainInner = '';

        if (mainMatch) {
            mainTagAttrs = mainMatch[1];
            mainInner = mainMatch[2];
        } else {
            // Si no tiene main, tomar el body
            const bodyMatch = rendered.match(/<body>([\s\S]*?)<\/body>/);
            mainInner = bodyMatch ? bodyMatch[1] : rendered;
        }

        // Corregir rutas de imágenes en el contenido y forzar carga inmediata
        mainInner = mainInner.replace(/src="\/img\//g, `src="${imgPrefix}`);
        mainInner = mainInner.replace(/(["'])\/img\/tienda\//g, `$1${imgPrefix}tienda/`);
        mainInner = mainInner.replace(/data-news-image="\/img\//g, `data-news-image="${imgPrefix}`);
        mainInner = mainInner.replace(/loading="lazy"/g, 'loading="eager"');

        // Corregir enlaces href="/" o "/proyectos/..." para navegación cliente
        // Vamos a envolver todo en un div.page-view
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

    // 4. Construir opciones del selector de revisión
    const selectOptions = pageConfigs.map(p => 
        `<option value="${p.id}" ${p.id === 'inicio' ? 'selected' : ''}>${p.label}</option>`
    ).join('\n                    ');

    // 5. JavaScript embebido para conmutación SPA y soporte interactivo
    const routerScript = `
    <script>
    (function() {
        const pageViews = document.querySelectorAll('.page-view');
        const reviewerSelect = document.getElementById('reviewer-page-select');
        const reviewerBar = document.getElementById('reviewer-bar');
        const reviewerToggle = document.getElementById('reviewer-toggle');

        // Mapeo de rutas a IDs de vista
        const routeMap = {
            '': 'inicio',
            '/': 'inicio',
            '#inicio': 'inicio',
            'index.html': 'inicio',
            
            '/nosotros': 'nosotros',
            'nosotros.html': 'nosotros',
            '#nosotros': 'nosotros',
            
            '/proyectos': 'proyectos',
            'proyectos.html': 'proyectos',
            '#proyectos': 'proyectos',
            
            '/proyectos/casa-ainbo': 'casa-ainbo',
            'casa-ainbo.html': 'casa-ainbo',
            '#casa-ainbo': 'casa-ainbo',
            
            '/proyectos/sonrisas-de-navidad': 'sonrisas-de-navidad',
            'sonrisas-de-navidad.html': 'sonrisas-de-navidad',
            '#sonrisas-de-navidad': 'sonrisas-de-navidad',
            
            '/proyectos/guardianes-del-itaya': 'guardianes-del-itaya',
            'guardianes-del-itaya.html': 'guardianes-del-itaya',
            '#guardianes-del-itaya': 'guardianes-del-itaya',
            
            '/proyectos/imfundo-yoga': 'imfundo-yoga',
            'imfundo-yoga.html': 'imfundo-yoga',
            '#imfundo-yoga': 'imfundo-yoga',
            
            '/proyectos/languages-for-hope': 'languages-for-hope',
            'languages-for-hope.html': 'languages-for-hope',
            '#languages-for-hope': 'languages-for-hope',
            
            '/proyectos/proyecto-butterfly': 'proyecto-butterfly',
            'proyecto-butterfly.html': 'proyecto-butterfly',
            '#proyecto-butterfly': 'proyecto-butterfly',
            
            '/proyectos/ainbo': 'ainbo',
            'ainbo.html': 'ainbo',
            '#ainbo': 'ainbo',
            
            '/se-un-voluntario': 'se-un-voluntario',
            'se-un-voluntario.html': 'se-un-voluntario',
            '#se-un-voluntario': 'se-un-voluntario',
            
            '/se-un-voluntario/voluntariado': 'voluntariado',
            '/se-voluntario': 'voluntariado',
            'voluntariado.html': 'voluntariado',
            'se-voluntario.html': 'voluntariado',
            '#voluntariado': 'voluntariado',
            '#se-voluntario': 'voluntariado',
            
            '/se-un-voluntario/apadrina-un-nino': 'apadrina-un-nino',
            '/apadrina-un-nino': 'apadrina-un-nino',
            'apadrina-un-nino.html': 'apadrina-un-nino',
            '#apadrina-un-nino': 'apadrina-un-nino',
            '#apadrinamiento': 'apadrina-un-nino',
            
            '/se-un-voluntario/contribuye-con-desayuno': 'contribuye-con-desayuno',
            '/contribuye-con-desayuno': 'contribuye-con-desayuno',
            'contribuye-con-desayuno.html': 'contribuye-con-desayuno',
            '#contribuye-con-desayuno': 'contribuye-con-desayuno',
            
            '/se-un-voluntario/implementa-un-espacio-educativo': 'implementa-un-espacio-educativo',
            '/implementa-un-espacio-educativo': 'implementa-un-espacio-educativo',
            'implementa-un-espacio-educativo.html': 'implementa-un-espacio-educativo',
            '#implementa-un-espacio-educativo': 'implementa-un-espacio-educativo',
            
            '/se-un-voluntario/dona-libros': 'dona-libros',
            '/dona-libros': 'dona-libros',
            'dona-libros.html': 'dona-libros',
            '#dona-libros': 'dona-libros',
            
            '/se-un-voluntario/apoya-los-emprendimientos-ainbo': 'apoya-los-emprendimientos-ainbo',
            '/apoya-los-emprendimientos-ainbo': 'apoya-los-emprendimientos-ainbo',
            'apoya-los-emprendimientos-ainbo.html': 'apoya-los-emprendimientos-ainbo',
            '/se-un-voluntario/apoya-ainbo': 'apoya-los-emprendimientos-ainbo',
            '/apoya-ainbo': 'apoya-los-emprendimientos-ainbo',
            'apoya-ainbo.html': 'apoya-los-emprendimientos-ainbo',
            '#apoya-ainbo': 'apoya-los-emprendimientos-ainbo',
            '#apoya-los-emprendimientos-ainbo': 'apoya-los-emprendimientos-ainbo',
            
            '/como-ayudar': 'como-ayudar',
            'como-ayudar.html': 'como-ayudar',
            '#como-ayudar': 'como-ayudar',

            '/tienda': 'tienda',
            'tienda.html': 'tienda',
            '#tienda': 'tienda'
        };

        // Función principal para cambiar de vista
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

            // Actualizar active state en navbar principal
            document.querySelectorAll('.site-nav a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && routeMap[href] === targetId) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });

            // Scroll al ancla o a la cima
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

        // Interceptar clics en enlaces
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;

            // Ignorar enlaces externos o mailto/tel/dialog
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
                return;
            }

            // Identificar si tiene hash (ej: nosotros.html#equipo o /como-ayudar#apadrinamiento)
            const parts = href.split('#');
            const pathPart = parts[0];
            const anchorPart = parts[1];

            // Si es un ancla interna de la página actual
            if (!pathPart && anchorPart) {
                // Chequear si el ancla corresponde a una subsección conocida
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
                // Si el elemento existe en el DOM actual, dejar que el browser scrollee
                return;
            }

            // Si coincide con alguna de nuestras rutas
            const targetId = routeMap[pathPart] || routeMap[href];
            if (targetId) {
                e.preventDefault();
                switchView(targetId, anchorPart);
            }
        });

        // Selector de revisión rápida
        reviewerSelect?.addEventListener('change', function(e) {
            switchView(e.target.value);
        });

        // Toggle para minimizar/expandir barra de revisión
        reviewerToggle?.addEventListener('click', function() {
            reviewerBar?.classList.toggle('is-minimized');
            const isMin = reviewerBar?.classList.contains('is-minimized');
            reviewerToggle.textContent = isMin ? '👁' : '✕';
        });

        // Inicializar según el hash de la URL si existe
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

    // 6. El JS base del sitio (menú, modales de noticias, carruseles)
    const mainJsPath = path.join(publicDir, 'js', 'main.js');
    let siteJs = '';
    if (fs.existsSync(mainJsPath)) {
        siteJs = fs.readFileSync(mainJsPath, 'utf8');
        // Asegurar que las imágenes de noticias no tengan barra inicial
        siteJs = siteJs.replace(/\/img\/chino\.jpeg/g, `${imgPrefix}chino.jpeg`);
    }

    // 7. HTML Final Unificado
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#ffffff">
    <meta name="description" content="Imfundo Kahle - Sitio Completo de Revisión. Todas las páginas y proyectos en un solo archivo independiente.">
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

    <!-- BARRA FLOTANTE DE REVISIÓN RÁPIDA -->
    <aside id="reviewer-bar" aria-label="Selector de vistas">
        <div class="reviewer-content">
            <span class="reviewer-title">👁 Vista Previa:</span>
            <select class="reviewer-select" id="reviewer-page-select" aria-label="Cambiar de página">
                ${selectOptions}
            </select>
        </div>
        <button class="reviewer-toggle" id="reviewer-toggle" type="button" title="Minimizar barra">✕</button>
    </aside>

    <!-- HEADER GLOBAL -->
    ${globalHeader}

    <!-- CONTENEDOR DE TODAS LAS PÁGINAS -->
    <div id="pages-container">
        ${pageViewsHtml.join('\n')}
    </div>

    <!-- FOOTER GLOBAL -->
    ${globalFooter}

    <!-- SCRIPTS INTERACTIVOS -->
    <script>
${siteJs}
    </script>
    ${routerScript}

</body>
</html>
`;
}

// Generar versión raíz: sitio_completo.html
console.log('Generando sitio_completo.html para la raíz del proyecto...');
const rootHtml = build(false);
const rootOutPath = path.join(rootDir, 'sitio_completo.html');
fs.writeFileSync(rootOutPath, rootHtml, 'utf8');
console.log(`✓ Generado con éxito: ${rootOutPath} (${(rootHtml.length / 1024).toFixed(1)} KB)`);

// Generar versión dist: dist/sitio_completo.html
console.log('Generando dist/sitio_completo.html para la carpeta dist...');
const distHtml = build(true);
const distOutPath = path.join(rootDir, 'dist', 'sitio_completo.html');
fs.writeFileSync(distOutPath, distHtml, 'utf8');
console.log(`✓ Generado con éxito: ${distOutPath} (${(distHtml.length / 1024).toFixed(1)} KB)`);
