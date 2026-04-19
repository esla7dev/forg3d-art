/* ============================================================
   Forg3d.Art — Shared JavaScript
   Shared across index.html & custom-gifts.html
   ============================================================ */

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
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
      c.classList.toggle('hidden', f !== 'all' && c.dataset.cat !== f);
    });
  });
});

// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal, .step, .product-card').forEach(el => {
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
  gtag('event', 'image_view', { event_category: 'engagement', event_label: alt });
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  if (lightboxTrigger) { lightboxTrigger.focus(); lightboxTrigger = null; }
}

// Lightbox close button
const lbCloseBtn = document.querySelector('.lightbox-close');
if (lbCloseBtn) lbCloseBtn.addEventListener('click', closeLightbox);

// Lightbox focus trap
document.getElementById('lightbox').addEventListener('keydown', function(e) {
  if (e.key !== 'Tab') return;
  const focusable = this.querySelectorAll('button');
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
  else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
});

// Lightbox keyboard navigation
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('active')) return;
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

// Lightbox backdrop click
document.getElementById('lightbox').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeLightbox();
});

// Lightbox arrow buttons
document.getElementById('lbPrev').addEventListener('click', () => {
  if (currentLightboxIndex > 0) {
    currentLightboxIndex--;
    document.getElementById('lightbox-img').src = allLightboxImages[currentLightboxIndex].src;
    document.getElementById('lightbox-img').alt = allLightboxImages[currentLightboxIndex].alt;
  }
});

document.getElementById('lbNext').addEventListener('click', () => {
  if (currentLightboxIndex < allLightboxImages.length - 1) {
    currentLightboxIndex++;
    document.getElementById('lightbox-img').src = allLightboxImages[currentLightboxIndex].src;
    document.getElementById('lightbox-img').alt = allLightboxImages[currentLightboxIndex].alt;
  }
});

// Progressive enhancement + filter count badges
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-enabled');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const filter = btn.dataset.filter;
    const count = filter === 'all'
      ? document.querySelectorAll('.product-card').length
      : document.querySelectorAll(`.product-card[data-cat="${filter}"]`).length;
    btn.innerHTML += ` <span style="opacity:0.6;font-size:9px;">(${count})</span>`;
  });
});

// Hamburger menu
const hamburger = document.getElementById('navHamburger');
const navUl = document.querySelector('nav ul');
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
