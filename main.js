/* Forg3d.Art — shared behavior for the retained cosplay site. */
'use strict';

document.body.classList.add('js-enabled');

const GA_MEASUREMENT_ID = 'G-X6Y6H31ESN';
const CONSENT_STORAGE_KEY = 'forg3d_consent';
const IMAGE_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%232a2a2a"/%3E%3Ctext x="300" y="305" fill="%23888888" font-family="monospace" font-size="20" text-anchor="middle"%3EImage unavailable%3C/text%3E%3C/svg%3E';

let analyticsConsent = 'denied';
let analyticsLoaded = false;
let storageAvailable = true;

function readStoredConsent() {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    storageAvailable = false;
    return null;
  }
}

function saveConsent(value) {
  if (!storageAvailable) return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch (error) {
    storageAvailable = false;
  }
}

function initializeDataLayer() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
}

function loadAnalytics() {
  if (analyticsConsent !== 'granted') return false;
  initializeDataLayer();
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted'
  });

  if (analyticsLoaded || document.querySelector('script[data-forg3d-analytics]')) {
    analyticsLoaded = true;
    return true;
  }

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  const script = document.createElement('script');
  script.async = true;
  script.dataset.forg3dAnalytics = 'true';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
  analyticsLoaded = true;
  return true;
}

function trackAnalyticsEvent(name, parameters = {}) {
  if (analyticsConsent !== 'granted' || !loadAnalytics()) return;
  window.gtag('event', name, parameters);
}

function expireAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(';')
    .map(cookie => cookie.split('=')[0].trim())
    .filter(name => name === '_ga' || name.startsWith('_ga_'));
  const domains = ['', location.hostname, `.${location.hostname}`];

  cookieNames.forEach(name => {
    domains.forEach(domain => {
      const domainPart = domain ? `; domain=${domain}` : '';
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domainPart}`;
    });
  });
}

function setAnalyticsConsent(value) {
  analyticsConsent = value === 'granted' ? 'granted' : 'denied';
  saveConsent(analyticsConsent);

  if (analyticsConsent === 'granted') {
    loadAnalytics();
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'granted' });
  } else {
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    expireAnalyticsCookies();
  }
}

let consentBanner = null;

function closeConsentBanner() {
  if (!consentBanner) return;
  consentBanner.classList.remove('show');
  const bannerToRemove = consentBanner;
  consentBanner = null;
  window.setTimeout(() => bannerToRemove.remove(), 400);
}

function showAnalyticsPreferences() {
  if (consentBanner) {
    consentBanner.querySelector('button')?.focus();
    return;
  }

  const banner = document.createElement('div');
  banner.className = 'consent-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'false');
  banner.setAttribute('aria-labelledby', 'analytics-consent-title');
  banner.innerHTML = `
    <div class="consent-text">
      <strong id="analytics-consent-title">Analytics preferences</strong><br>
      Google Analytics is optional and is not loaded unless you accept.
      Declining keeps every shop feature working. <a href="/info.html#privacy">Privacy details</a>.
    </div>
    <div class="consent-actions">
      <button class="consent-btn decline" type="button">Disable analytics</button>
      <button class="consent-btn accept" type="button">Accept analytics</button>
    </div>`;
  document.body.appendChild(banner);
  consentBanner = banner;
  requestAnimationFrame(() => banner.classList.add('show'));

  banner.querySelector('.accept').addEventListener('click', () => {
    setAnalyticsConsent('granted');
    closeConsentBanner();
  });
  banner.querySelector('.decline').addEventListener('click', () => {
    setAnalyticsConsent('denied');
    closeConsentBanner();
  });
  banner.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeConsentBanner();
  });
  banner.querySelector('.decline').focus();
}

const storedConsent = readStoredConsent();
if (storedConsent === 'granted') {
  analyticsConsent = 'granted';
  loadAnalytics();
} else if (storedConsent !== 'denied') {
  requestAnimationFrame(showAnalyticsPreferences);
}

window.forg3dAnalytics = {
  loadAnalytics,
  trackAnalyticsEvent,
  openPreferences: showAnalyticsPreferences,
  revoke: () => setAnalyticsConsent('denied')
};

document.getElementById('analyticsPreferences')?.addEventListener('click', showAnalyticsPreferences);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href === '#') return;
  link.addEventListener('click', event => {
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', href);
  });
});

const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const productCards = Array.from(document.querySelectorAll('.product-card'));

function activateFilter(filter) {
  filterButtons.forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  productCards.forEach(card => {
    const categories = (card.dataset.cat || '').split(/\s+/);
    card.classList.toggle('hidden', filter !== 'all' && !categories.includes(filter));
  });
}

filterButtons.forEach(button => {
  const filter = button.dataset.filter;
  const count = filter === 'all'
    ? productCards.length
    : productCards.filter(card => (card.dataset.cat || '').split(/\s+/).includes(filter)).length;
  const countLabel = document.createElement('span');
  countLabel.className = 'filter-count';
  countLabel.textContent = ` (${count})`;
  button.appendChild(countLabel);
  button.addEventListener('click', () => activateFilter(filter));
});

const hashFilter = decodeURIComponent(location.hash.slice(1));
if (/^[a-z][a-z0-9-]*$/.test(hashFilter) && filterButtons.some(button => button.dataset.filter === hashFilter)) {
  activateFilter(hashFilter);
  document.querySelector('.filter-tabs')?.closest('section')?.scrollIntoView();
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.opacity = '';
        entry.target.style.transform = '';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal, .product-card').forEach(element => {
    if (!element.classList.contains('reveal')) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }
    revealObserver.observe(element);
  });
}

const imageLoadCleanup = new WeakMap();

function watchImageLoading(card, image) {
  imageLoadCleanup.get(image)?.();

  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    card.classList.remove('skeleton');
    image.removeEventListener('load', finish);
    image.removeEventListener('error', fail);
  };
  const fail = () => {
    finish();
    if (image.src !== IMAGE_FALLBACK) image.src = IMAGE_FALLBACK;
  };
  const cleanup = () => {
    image.removeEventListener('load', finish);
    image.removeEventListener('error', fail);
  };
  imageLoadCleanup.set(image, cleanup);

  if (image.complete && image.naturalWidth > 0) {
    finish();
    return;
  }

  image.addEventListener('load', finish, { once: true });
  image.addEventListener('error', fail, { once: true });
  card.classList.add('skeleton');

  if (image.complete) {
    if (image.naturalWidth > 0) finish();
    else fail();
  }
}

function updateCardImage(card, index) {
  const images = JSON.parse(card.dataset.images || '[]');
  const image = card.querySelector('.card-img-link img, .lightbox-trigger img, .gallery-main-img');
  if (!image || !images[index]) return;

  imageLoadCleanup.get(image)?.();
  card.classList.add('skeleton');
  const baseAlt = image.dataset.baseAlt || image.alt.replace(/ — alternate view$/, '');
  image.dataset.baseAlt = baseAlt;
  image.alt = index === 0 ? baseAlt : `${baseAlt} — alternate view`;
  image.title = image.alt;
  card.dataset.current = String(index);
  card.querySelector('.img-current').textContent = String(index + 1);

  image.src = images[index];
  watchImageLoading(card, image);
}

document.querySelectorAll('.card-img[data-images]').forEach(card => {
  const image = card.querySelector('.card-img-link img, .lightbox-trigger img');
  if (!image) return;
  image.dataset.baseAlt = image.alt;
  image.title = image.alt;
  watchImageLoading(card, image);

  const images = JSON.parse(card.dataset.images || '[]');
  card.querySelector('.img-total').textContent = String(images.length);
  let touchStartX = 0;
  let touchStartY = 0;
  const showPrevious = () => {
    const current = Number(card.dataset.current || 0);
    updateCardImage(card, (current - 1 + images.length) % images.length);
  };
  const showNext = () => {
    const current = Number(card.dataset.current || 0);
    updateCardImage(card, (current + 1) % images.length);
  };
  card.querySelector('.img-nav.prev')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    showPrevious();
  });
  card.querySelector('.img-nav.next')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    showNext();
  });
  card.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });
  card.addEventListener('touchend', event => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
    event.preventDefault();
    if (deltaX > 0) showPrevious();
    else showNext();
  });
});

document.querySelectorAll('.product-card[data-url]').forEach(card => {
  card.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    if (event.target.closest('a, button, input, select, textarea')) return;
    window.location.href = card.dataset.url;
  });
});

function updateProductGallery(gallery, index) {
  const images = JSON.parse(gallery.dataset.images || '[]');
  const alts = JSON.parse(gallery.dataset.alts || '[]');
  const image = gallery.querySelector('.gallery-main-img');
  if (!image || !images[index]) return;

  gallery.dataset.current = String(index);
  imageLoadCleanup.get(image)?.();
  gallery.classList.add('skeleton');
  image.src = images[index];
  image.alt = alts[index] || image.alt;
  image.title = image.alt;
  gallery.querySelector('.gallery-current').textContent = String(index + 1);
  gallery.querySelectorAll('.gallery-thumb').forEach(button => {
    const active = Number(button.dataset.index) === index;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  watchImageLoading(gallery, image);
}

document.querySelectorAll('.product-gallery[data-images]').forEach(gallery => {
  const images = JSON.parse(gallery.dataset.images || '[]');
  const image = gallery.querySelector('.gallery-main-img');
  if (!image || !images.length) return;
  let touchStartX = 0;
  let touchStartY = 0;
  gallery.querySelector('.gallery-total').textContent = String(images.length);
  image.title = image.alt;
  watchImageLoading(gallery, image);

  const showPrevious = () => {
    const current = Number(gallery.dataset.current || 0);
    updateProductGallery(gallery, (current - 1 + images.length) % images.length);
  };
  const showNext = () => {
    const current = Number(gallery.dataset.current || 0);
    updateProductGallery(gallery, (current + 1) % images.length);
  };

  gallery.querySelector('.gallery-nav.prev')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    showPrevious();
  });
  gallery.querySelector('.gallery-nav.next')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    showNext();
  });
  gallery.querySelectorAll('.gallery-thumb').forEach(button => {
    button.addEventListener('click', () => updateProductGallery(gallery, Number(button.dataset.index || 0)));
  });
  gallery.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });
  gallery.addEventListener('touchend', event => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
    event.preventDefault();
    if (deltaX > 0) showPrevious();
    else showNext();
  });
});

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxTriggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
const lightboxPrevious = document.getElementById('lbPrev');
const lightboxNext = document.getElementById('lbNext');
let lightboxIndex = -1;
let lightboxImages = [];
let lightboxAlts = [];
let lightboxLabel = 'Product';
let lastLightboxTrigger = null;
let lightboxInertRegions = [];
let bodyOverflowBeforeDialog = '';

function setRegionsInert(regions, inert) {
  regions.forEach(element => {
    if (!element) return;
    if (inert) element.setAttribute('inert', '');
    else element.removeAttribute('inert');
  });
}

function updateLightbox() {
  if (!lightboxImages[lightboxIndex]) return;
  lightboxImage.src = lightboxImages[lightboxIndex];
  lightboxImage.alt = lightboxAlts[lightboxIndex] || lightboxLabel;
  lightboxImage.title = lightboxImage.alt;
  lightboxTitle.textContent = `${lightboxLabel} image ${lightboxIndex + 1} of ${lightboxImages.length}`;
  lightboxPrevious.disabled = lightboxImages.length < 2;
  lightboxNext.disabled = lightboxImages.length < 2;
}

function openLightbox(trigger) {
  if (!lightbox) return;
  lastLightboxTrigger = trigger;
  const gallery = trigger.closest('.product-gallery[data-images]');
  if (gallery) {
    lightboxImages = JSON.parse(gallery.dataset.images || '[]');
    lightboxAlts = JSON.parse(gallery.dataset.alts || '[]');
    lightboxIndex = Number(gallery.dataset.current || 0);
    lightboxLabel = trigger.getAttribute('aria-label').replace(/^Open full-size gallery for /, '');
  } else {
    lightboxImages = lightboxTriggers
      .map(item => item.querySelector('img'))
      .filter(Boolean)
      .map(image => image.currentSrc || image.src);
    lightboxAlts = lightboxTriggers
      .map(item => item.querySelector('img'))
      .filter(Boolean)
      .map(image => image.alt);
    lightboxIndex = lightboxTriggers.indexOf(trigger);
    lightboxLabel = trigger.getAttribute('aria-label').replace(/^View larger image of /, '');
  }
  if (lightboxIndex < 0 || !lightboxImages[lightboxIndex]) return;
  updateLightbox();
  lightboxInertRegions = Array.from(document.body.children).filter(element =>
    element !== lightbox && !['SCRIPT', 'NOSCRIPT'].includes(element.tagName)
  );
  setRegionsInert(lightboxInertRegions, true);
  bodyOverflowBeforeDialog = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  lightbox.classList.add('active');
  document.getElementById('lbClose').focus();
  trackAnalyticsEvent('image_view', {
    event_category: 'engagement',
    event_label: lightboxImage.alt
  });
}

function closeLightbox() {
  if (!lightbox?.classList.contains('active')) return;
  lightbox.classList.remove('active');
  setRegionsInert(lightboxInertRegions, false);
  lightboxInertRegions = [];
  document.body.style.overflow = bodyOverflowBeforeDialog;
  lastLightboxTrigger?.focus();
  lastLightboxTrigger = null;
}

lightboxTriggers.forEach(trigger => trigger.addEventListener('click', () => openLightbox(trigger)));
document.getElementById('lbClose')?.addEventListener('click', closeLightbox);
lightboxPrevious?.addEventListener('click', () => {
  if (lightboxImages.length < 2) return;
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  updateLightbox();
});
lightboxNext?.addEventListener('click', () => {
  if (lightboxImages.length < 2) return;
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  updateLightbox();
});
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});
lightbox?.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeLightbox();
    return;
  }
  if (event.key === 'ArrowLeft' && !lightboxPrevious.disabled) {
    event.preventDefault();
    lightboxPrevious.click();
  }
  if (event.key === 'ArrowRight' && !lightboxNext.disabled) {
    event.preventDefault();
    lightboxNext.click();
  }
  if (event.key !== 'Tab') return;
  const focusable = Array.from(lightbox.querySelectorAll('button:not(:disabled)'));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const hamburger = document.getElementById('navHamburger');
const primaryNavigation = document.getElementById('primaryNavigation');
let menuInertRegions = [];
let bodyOverflowBeforeMenu = '';

function closeMobileMenu(restoreFocus = false) {
  if (!primaryNavigation?.classList.contains('mobile-open')) return;
  primaryNavigation.classList.remove('mobile-open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open menu');
  setRegionsInert(menuInertRegions, false);
  menuInertRegions = [];
  document.body.style.overflow = bodyOverflowBeforeMenu;
  if (restoreFocus) hamburger.focus();
}

function openMobileMenu() {
  bodyOverflowBeforeMenu = document.body.style.overflow;
  const nav = hamburger.closest('nav');
  menuInertRegions = [
    ...Array.from(document.body.children).filter(element =>
      element !== nav && !['SCRIPT', 'NOSCRIPT'].includes(element.tagName)
    ),
    ...Array.from(nav.children).filter(element => element !== hamburger && element !== primaryNavigation)
  ].filter(Boolean);
  setRegionsInert(menuInertRegions, true);
  primaryNavigation.classList.add('mobile-open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Close menu');
  document.body.style.overflow = 'hidden';
  primaryNavigation.querySelector('a')?.focus();
}

if (hamburger && primaryNavigation) {
  hamburger.addEventListener('click', () => {
    if (primaryNavigation.classList.contains('mobile-open')) closeMobileMenu(true);
    else openMobileMenu();
  });
  primaryNavigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu(true));
  });
  document.addEventListener('keydown', event => {
    if (!primaryNavigation.classList.contains('mobile-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMobileMenu(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...primaryNavigation.querySelectorAll('a'), hamburger];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
  link.addEventListener('click', () => {
    const card = link.closest('.product-card');
    const label = card?.querySelector('.card-name')?.textContent.trim()
      || link.dataset.wa
      || link.getAttribute('aria-label')
      || link.textContent.trim()
      || 'whatsapp_link';
    trackAnalyticsEvent('whatsapp_click', {
      event_category: 'engagement',
      event_label: label
    });
  });
});

document.querySelectorAll('.btn-order').forEach(button => {
  button.addEventListener('click', event => {
    const bounds = button.getBoundingClientRect();
    const size = Math.max(bounds.width, bounds.height) * 1.4;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - bounds.left - size / 2}px`;
    ripple.style.top = `${event.clientY - bounds.top - size / 2}px`;
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
});

const whatsappButton = document.getElementById('btnWaBig');
const particlesCanvas = document.getElementById('wa-particles');
if (whatsappButton && particlesCanvas) {
  let particles = [];
  let running = false;
  const resizeCanvas = () => {
    particlesCanvas.width = whatsappButton.offsetWidth;
    particlesCanvas.height = whatsappButton.offsetHeight;
  };
  const burst = (x, y) => {
    for (let index = 0; index < 20; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        alpha: 1,
        color: Math.random() > 0.5 ? '#fff' : '#a8ffc8'
      });
    }
  };
  const animateParticles = () => {
    const context = particlesCanvas.getContext('2d');
    context.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    particles = particles.filter(particle => particle.alpha > 0.02);
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.09;
      particle.alpha *= 0.93;
      context.globalAlpha = particle.alpha;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    if (particles.length) requestAnimationFrame(animateParticles);
    else running = false;
  };
  const addParticles = event => {
    const bounds = whatsappButton.getBoundingClientRect();
    burst(event.clientX - bounds.left, event.clientY - bounds.top);
    if (!running) {
      running = true;
      animateParticles();
    }
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  whatsappButton.addEventListener('mouseenter', addParticles);
  whatsappButton.addEventListener('mousemove', event => {
    if (Math.random() > 0.7) addParticles(event);
  });
  whatsappButton.addEventListener('click', addParticles);
}

const backToTop = document.createElement('button');
backToTop.className = 'back-to-top';
backToTop.type = 'button';
backToTop.setAttribute('aria-label', 'Back to top');
backToTop.textContent = '↑';
document.body.appendChild(backToTop);
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
