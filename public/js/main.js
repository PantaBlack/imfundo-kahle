const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

// Alternar menú hamburguesa móvil
menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
    siteNav?.classList.toggle('is-open', !isOpen);
});

const navDropdowns = document.querySelectorAll('.nav-dropdown');

navDropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    const arrow = dropdown.querySelector('.nav-dropdown-arrow, .nav-dropdown-trigger span');

    const setDropdownOpen = (isOpen) => {
        dropdown.classList.toggle('is-open', isOpen);
        trigger?.setAttribute('aria-expanded', String(isOpen));
    };

    // Al hacer clic en la flecha (icono) en móvil/táctil, se abre/cierra el submenú acordeón
    arrow?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isCurrentlyOpen = dropdown.classList.contains('is-open');
        setDropdownOpen(!isCurrentlyOpen);
    });

    // En pantallas con cursor (desktop), se despliega al pasar el puntero
    dropdown.addEventListener('pointerenter', () => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            setDropdownOpen(true);
        }
    });

    dropdown.addEventListener('pointerleave', () => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !dropdown.contains(document.activeElement)) {
            setDropdownOpen(false);
        }
    });

    // Al hacer clic en los enlaces del submenú, cerrar el menú y permitir la navegación
    dropdown.querySelectorAll('.nav-dropdown-menu a').forEach((link) => {
        link.addEventListener('click', () => {
            setDropdownOpen(false);
            menuToggle?.setAttribute('aria-expanded', 'false');
            menuToggle?.setAttribute('aria-label', 'Abrir menú');
            siteNav?.classList.remove('is-open');
        });
    });
});

// Cerrar el menú móvil al hacer clic en enlaces directos (no flechas)
siteNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (event) => {
        // Si el clic fue directamente en la flecha de desplegar, no cerrar el menú ni navegar
        if (event.target.closest('.nav-dropdown-arrow') || (event.target.tagName === 'SPAN' && event.target.parentElement?.classList.contains('nav-dropdown-trigger'))) {
            return;
        }
        menuToggle?.setAttribute('aria-expanded', 'false');
        menuToggle?.setAttribute('aria-label', 'Abrir menú');
        siteNav?.classList.remove('is-open');
    });
});

// Cerrar menús desplegables al hacer clic fuera
document.addEventListener('click', (event) => {
    navDropdowns.forEach((dropdown) => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('is-open');
            dropdown.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        navDropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector('.nav-dropdown-trigger');
            if (dropdown.classList.contains('is-open')) {
                dropdown.classList.remove('is-open');
                trigger?.setAttribute('aria-expanded', 'false');
                trigger?.focus();
            }
        });
    }
});

document.querySelector('.subscribe-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const feedback = form.querySelector('.form-feedback');
    feedback.textContent = '¡Gracias por tu interés! Pronto habilitaremos las suscripciones.';
    form.reset();
});

const newsDialog = document.querySelector('.news-dialog');
const newsCards = [...document.querySelectorAll('.news-card-button')];

newsCards.forEach((card) => {
    card.addEventListener('click', () => {
        const dialogImage = newsDialog.querySelector('.news-dialog-image');
        dialogImage.src = card.dataset.newsImage;
        dialogImage.alt = card.dataset.newsAlt;
        dialogImage.classList.toggle('is-chino', card.dataset.newsImage === '/img/chino.jpeg');
        newsDialog.querySelector('.news-dialog-date').textContent = card.dataset.newsDate;
        newsDialog.querySelector('#news-dialog-title').textContent = card.dataset.newsTitle;
        newsDialog.querySelector('.news-dialog-detail').textContent = card.dataset.newsDetail;
        newsDialog.querySelector('.news-dialog-extra').textContent = card.dataset.newsExtra;
        newsDialog.showModal();
    });
});

newsDialog?.querySelector('.news-dialog-close')?.addEventListener('click', () => newsDialog.close());
newsDialog?.querySelector('.news-dialog-cta')?.addEventListener('click', () => newsDialog.close());
newsDialog?.addEventListener('click', (event) => {
    if (event.target === newsDialog) newsDialog.close();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && newsDialog?.open) newsDialog.close();
});

const newsTrack = document.querySelector('.news-grid');
const newsControls = document.querySelectorAll('.news-control');

newsControls.forEach((control) => {
    control.addEventListener('click', () => {
        const step = Number(control.dataset.newsStep);
        const cardStep = newsCards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(newsTrack).columnGap);
        const lastPosition = newsTrack.scrollWidth - newsTrack.clientWidth;

        if (step > 0 && newsTrack.scrollLeft >= lastPosition - 1) {
            newsTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else if (step < 0 && newsTrack.scrollLeft <= 1) {
            newsTrack.scrollTo({ left: lastPosition, behavior: 'smooth' });
        } else {
            newsTrack.scrollBy({ left: step * cardStep, behavior: 'smooth' });
        }
    });
});
