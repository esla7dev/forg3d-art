/* ============================================================
   Forg3d.Art — Shared JavaScript
   Shared across index.html & custom-gifts.html
   ============================================================ */

// Register service worker for PWA / offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  if (a.getAttribute('href') === '#') return;
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

// Filter tabs
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const f = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(c => {
      const categories = (c.dataset.cat || '').split(' ');
      c.classList.toggle('hidden', f !== 'all' && !categories.includes(f));
    });
  });
});

// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal, .product-card').forEach(el => {
  if (!el.classList.contains('reveal')) {
    el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  }
  obs.observe(el);
});

// Lightbox functionality
const allLightboxImages = Array.from(document.querySelectorAll('.card-img img'));
let currentLightboxIndex = -1;
let lightboxTrigger = null;

allLightboxImages.forEach(img => {
  img.addEventListener('click', () => { lightboxTrigger = img; openLightbox(img.src, img.alt); });
});

function openLightbox(src, alt) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-img').alt = alt;
  lb.classList.add('active');
  currentLightboxIndex = allLightboxImages.findIndex(i => i.src === src || i.getAttribute('src') === src);
  const closeBtn = lb.querySelector('.lightbox-close');
  if (closeBtn) closeBtn.focus();
  if (typeof gtag === 'function') {
    gtag('event', 'image_view', { event_category: 'engagement', event_label: alt });
  }
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  if (lightboxTrigger) { lightboxTrigger.focus(); lightboxTrigger = null; }
}

// Lightbox close button
const lbCloseBtn = document.querySelector('.lightbox-close');
if (lbCloseBtn) lbCloseBtn.addEventListener('click', closeLightbox);

// Lightbox listeners (only wire up when a lightbox exists on the page)
const lightboxEl = document.getElementById('lightbox');
if (lightboxEl) {
  // Focus trap
  lightboxEl.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    const focusable = this.querySelectorAll('button');
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxEl.classList.contains('active')) return;
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowRight' && currentLightboxIndex < allLightboxImages.length - 1) {
      currentLightboxIndex++;
      document.getElementById('lightbox-img').src = allLightboxImages[currentLightboxIndex].src;
      document.getElementById('lightbox-img').alt = allLightboxImages[currentLightboxIndex].alt;
    }
    if (e.key === 'ArrowLeft' && currentLightboxIndex > 0) {
      currentLightboxIndex--;
      document.getElementById('lightbox-img').src = allLightboxImages[currentLightboxIndex].src;
      document.getElementById('lightbox-img').alt = allLightboxImages[currentLightboxIndex].alt;
    }
  });

  // Backdrop click
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });

  // Arrow buttons
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  if (lbPrev) lbPrev.addEventListener('click', () => {
    if (currentLightboxIndex > 0) {
      currentLightboxIndex--;
      document.getElementById('lightbox-img').src = allLightboxImages[currentLightboxIndex].src;
      document.getElementById('lightbox-img').alt = allLightboxImages[currentLightboxIndex].alt;
    }
  });
  if (lbNext) lbNext.addEventListener('click', () => {
    if (currentLightboxIndex < allLightboxImages.length - 1) {
      currentLightboxIndex++;
      document.getElementById('lightbox-img').src = allLightboxImages[currentLightboxIndex].src;
      document.getElementById('lightbox-img').alt = allLightboxImages[currentLightboxIndex].alt;
    }
  });
}

// Progressive enhancement + filter count badges
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-enabled');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const filter = btn.dataset.filter;
    let count = 0;
    if (filter === 'all') {
      count = document.querySelectorAll('.product-card').length;
    } else {
      document.querySelectorAll('.product-card').forEach(c => {
        const cats = (c.dataset.cat || '').split(' ');
        if (cats.includes(filter)) count++;
      });
    }
    btn.innerHTML += ` <span style="opacity:0.6;font-size:9px;">(${count})</span>`;
  });

  // Category deep-links: #<data-filter value> activates the matching filter
  // tab (e.g. custom-gifts.html#islamic-decor from the gift guides).
  const hashFilter = decodeURIComponent(location.hash.slice(1));
  if (/^[a-z][a-z0-9-]*$/.test(hashFilter) && hashFilter !== 'all' && !document.getElementById(hashFilter)) {
    const tab = document.querySelector(`.filter-btn[data-filter="${hashFilter}"]`);
    if (tab) {
      tab.click();
      const section = tab.closest('section');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

// Hamburger menu (only when present)
const hamburger = document.getElementById('navHamburger');
const navUl = document.querySelector('nav ul');
if (hamburger && navUl) {
  hamburger.addEventListener('click', () => {
    const isOpen = navUl.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  document.querySelectorAll('nav ul a').forEach(a => {
    a.addEventListener('click', () => {
      navUl.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });
  document.addEventListener('click', (e) => {
    if (navUl.classList.contains('mobile-open') && !navUl.contains(e.target) && !hamburger.contains(e.target)) {
      navUl.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navUl.classList.contains('mobile-open')) {
      navUl.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });
}

// Generic WhatsApp conversion tracking.
// Fires on every wa.me link except product order buttons (.btn-order), which
// already track themselves with a product-specific label on index.html.
document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
  if (a.classList.contains('btn-order')) return;
  a.addEventListener('click', () => {
    if (typeof gtag !== 'function') return;
    const label = a.dataset.wa || a.getAttribute('aria-label') || a.textContent.trim() || 'whatsapp_link';
    gtag('event', 'whatsapp_click', { event_category: 'engagement', event_label: label });
  });
});

// Cookie consent banner (Google Consent Mode).
// Analytics stays denied until the visitor accepts; choice persisted in localStorage.
(function() {
  let stored = null;
  try { stored = localStorage.getItem('forg3d_consent'); } catch (e) { return; }
  if (stored === 'granted' || stored === 'denied') return; // already chose

  const banner = document.createElement('div');
  banner.className = 'consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML =
    '<div class="consent-text">We use cookies for analytics to improve the site. ' +
    'You can accept or decline — declining keeps everything working. ' +
    '<a href="info.html#info">Learn more</a>.</div>' +
    '<div class="consent-actions">' +
    '<button class="consent-btn decline" type="button">Decline</button>' +
    '<button class="consent-btn accept" type="button">Accept</button>' +
    '</div>';
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('show'));

  function choose(value) {
    try { localStorage.setItem('forg3d_consent', value); } catch (e) {}
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: value === 'granted' ? 'granted' : 'denied' });
    }
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 400);
  }
  banner.querySelector('.accept').addEventListener('click', () => choose('granted'));
  banner.querySelector('.decline').addEventListener('click', () => choose('denied'));
})();

// Back to top button
(function() {
  const btt = document.createElement('button');
  btt.className = 'back-to-top';
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '&#8593;';
  document.body.appendChild(btt);
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });
  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
