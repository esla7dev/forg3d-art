'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_DIR = path.join(ROOT, 'products');
const SITE = 'https://forg3d.art';
const PHONE = '201096677140';

const whatsappSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

const products = [
  {
    slug: 'optimus-prime-cosplay-mask',
    file: 'optimus-prime-cosplay-mask.html',
    title: 'Optimus Prime Cosplay Mask (Egypt)',
    schemaName: 'Optimus Prime Cosplay Helmet Egypt',
    shortName: 'Optimus Prime',
    category: 'Sci-Fi',
    cat: 'sci-fi',
    status: 'Out of Stock',
    stockClass: 'out-of-stock',
    availability: 'https://schema.org/OutOfStock',
    price: '3,000 EGP',
    priceValue: '3000',
    was: '4,000 EGP',
    images: ['images/optimus-prime-cosplay-mask-egypt.jpeg', 'images/optimus-prime-cosplay-mask-egypt-2.jpg'],
    alt: 'Optimus Prime cosplay mask Egypt wearable 3D printed',
    description: 'Wearable Optimus Prime cosplay helmet with LED eyes, 3D printed and hand-finished in Egypt. Perfect for conventions, photoshoots, and collectors looking for a high-quality Transformers build.',
    specs: [['Feature', 'LED Eyes'], ['Finish', 'Metallic'], ['Type', 'Wearable'], ['Dimensions', '30x25x15cm']],
    whatsapp: 'Hi, I would like to ask about availability for the Optimus Prime helmet.',
    cta: 'Ask About Availability'
  },
  {
    slug: 'sauron-cosplay-mask',
    file: 'sauron-cosplay-mask.html',
    title: 'Dark Lord Sauron Cosplay Mask (Egypt)',
    schemaName: 'Dark Lord Sauron Cosplay Helmet Egypt',
    shortName: 'Sauron',
    category: 'Fantasy',
    cat: 'fantasy',
    status: 'Out of Stock',
    stockClass: 'out-of-stock',
    availability: 'https://schema.org/OutOfStock',
    price: '3,000 EGP',
    priceValue: '3000',
    was: '4,000 EGP',
    images: ['images/sauron-cosplay-mask-egypt.jpg', 'images/sauron-cosplay-mask-egypt-2.jpg'],
    alt: 'Sauron cosplay mask Egypt wearable 3D printed',
    description: 'Wearable Dark Lord Sauron cosplay helmet, 3D printed and hand-finished in Egypt. Screen-accurate design perfect for Lord of the Rings conventions and serious collectors.',
    specs: [['Feature', 'Spiked Crown'], ['Finish', 'Dark Steel'], ['Type', 'Full Armor'], ['Dimensions', '35x30x20cm']],
    whatsapp: 'Hi, I would like to ask about availability for the Sauron helmet.',
    cta: 'Ask About Availability'
  },
  {
    slug: 'wolverine-cosplay-mask',
    file: 'wolverine-cosplay-mask.html',
    title: 'Wolverine Cosplay Mask (Egypt)',
    schemaName: 'Wolverine Cosplay Mask Egypt',
    shortName: 'Wolverine',
    category: 'Superhero',
    cat: 'superhero',
    status: 'In Stock',
    stockClass: 'in-stock',
    availability: 'https://schema.org/InStock',
    sale: true,
    price: '2,299 EGP',
    priceValue: '2299',
    was: '2,500 EGP',
    images: ['images/wolverine-cosplay-mask-egypt.webp', 'images/wolverine-cosplay-mask-egypt-2.webp'],
    alt: 'Wolverine cosplay mask Egypt wearable 3D printed',
    description: 'Wearable Wolverine cosplay helmet with signature pointed ears, 3D printed and hand-finished in Egypt. Perfect for X-Men conventions and costume events.',
    specs: [['Accuracy', 'Screen-Accurate'], ['Build', 'Lightweight'], ['Type', 'Wearable'], ['Dimensions', '28x22x12cm']],
    whatsapp: 'Hi, I would like to order the Wolverine cowl!',
    cta: 'Order Now'
  },
  {
    slug: 'jack-skellington-cosplay-mask',
    file: 'jack-skellington-cosplay-mask.html',
    title: 'Jack Skellington Cosplay Mask (Egypt)',
    schemaName: 'Jack Skellington Cosplay Mask Egypt',
    shortName: 'Jack Skellington',
    category: 'Fantasy',
    cat: 'fantasy',
    status: 'Made to Order',
    stockClass: 'custom',
    availability: 'https://schema.org/PreOrder',
    sale: true,
    price: '3,000 EGP',
    priceValue: '3000',
    was: '4,000 EGP',
    images: ['images/jack-skellington-cosplay-mask-egypt.png', 'images/jack-skellington-cosplay-mask-egypt-2.png'],
    alt: 'Jack Skellington cosplay mask Egypt wearable 3D printed',
    description: 'Wearable Jack Skellington cosplay mask with mesh eye inserts, 3D printed and hand-finished in Egypt. Perfect for Halloween, conventions, and collectors wanting comfortable, accurate cosplay gear.',
    specs: [['Eyes', 'Mesh Inserts'], ['Detail', 'Hand-Finished'], ['Type', 'Wearable'], ['Dimensions', '32x26x14cm']],
    whatsapp: 'Hi, I would like to order the Jack Skellington mask!',
    cta: 'Order Now'
  },
  {
    slug: 'deadpool-cosplay-mask',
    file: 'deadpool-cosplay-mask.html',
    title: 'Deadpool Cosplay Mask (Egypt)',
    schemaName: 'Deadpool Cosplay Mask Egypt',
    shortName: 'Deadpool',
    category: 'Superhero',
    cat: 'superhero',
    status: 'In Stock',
    stockClass: 'in-stock',
    availability: 'https://schema.org/InStock',
    sale: true,
    price: '1,299 EGP',
    priceValue: '1299',
    was: '1,600 EGP',
    images: ['images/deadpool-cosplay-mask-egypt.webp', 'images/deadpool-cosplay-mask-egypt-2.webp'],
    alt: 'Deadpool cosplay mask Egypt wearable 3D printed',
    description: 'Wearable Deadpool cosplay mask with mesh eye lenses, 3D printed and hand-finished in Egypt. Screen-accurate design perfect for conventions, cosplay competitions, and Marvel fans.',
    specs: [['Eyes', 'Mesh Lenses'], ['Finish', 'Textured Red'], ['Type', 'Wearable'], ['Accuracy', 'Screen-Accurate']],
    whatsapp: 'Hi, I would like to order the Deadpool mask!',
    cta: 'Order Now'
  },
  {
    slug: 'joker-bank-heist-cosplay-mask',
    file: 'joker-bank-heist-cosplay-mask.html',
    title: 'Joker Bank Heist Cosplay Mask (Egypt)',
    schemaName: 'Joker Bank Heist Cosplay Mask Egypt',
    shortName: 'Joker Bank Heist',
    category: 'Villain',
    cat: 'villain',
    status: 'Made to Order',
    stockClass: 'custom',
    availability: 'https://schema.org/PreOrder',
    price: '1,299 EGP',
    priceValue: '1299',
    was: '1,600 EGP',
    images: ['images/joker-cosplay-mask-egypt.webp', 'images/joker-cosplay-mask-egypt-2.webp'],
    alt: 'Joker cosplay mask Egypt wearable 3D printed',
    description: 'Wearable Joker cosplay mask from The Dark Knight, 3D printed and hand-finished in Egypt. Full-face design with screen-accurate details, perfect for conventions and collectors.',
    specs: [['Coverage', 'Full-Face'], ['Accuracy', 'Screen-Accurate'], ['Type', 'Wearable'], ['Use', 'Halloween Ready']],
    whatsapp: 'Hi, I would like to order the Joker mask!',
    cta: 'Order Now'
  },
  {
    slug: 'iron-man-mk-46-cosplay-mask',
    file: 'iron-man-mk-46-cosplay-mask.html',
    title: 'Iron Man MK-46 Cosplay Mask (Egypt)',
    schemaName: 'Iron Man MK-46 Cosplay Helmet Egypt',
    shortName: 'Iron Man MK-46',
    category: 'Superhero',
    cat: 'superhero',
    status: 'In Stock',
    stockClass: 'in-stock',
    availability: 'https://schema.org/InStock',
    price: '2,999 EGP',
    priceValue: '2999',
    was: '3,500 EGP',
    images: ['images/iron-man-cosplay-mask-egypt.webp', 'images/iron-man-cosplay-mask-egypt-2.webp'],
    alt: 'Iron Man cosplay mask Egypt wearable 3D printed',
    description: 'Wearable Iron Man Mark 46 cosplay helmet with LED-compatible eyes, 3D printed and hand-finished in Egypt. Perfect for MCU fans, conventions, and serious costume enthusiasts.',
    specs: [['Eyes', 'LED-Compatible'], ['Finish', 'Weathered'], ['Type', 'Wearable'], ['Extra', 'Hinged Faceplate']],
    whatsapp: 'Hi, I would like to order the Iron Man MK-46!',
    cta: 'Order Now'
  },
  {
    slug: 'discohead-cosplay-mask',
    file: 'discohead-cosplay-mask.html',
    title: 'DiscoHead Cosplay Mask (Egypt)',
    schemaName: 'DiscoHead Cosplay Helmet Egypt',
    shortName: 'DiscoHead',
    category: 'Sci-Fi',
    cat: 'sci-fi',
    status: 'Made to Order',
    stockClass: 'custom',
    availability: 'https://schema.org/PreOrder',
    price: '3,800 EGP',
    priceValue: '3800',
    was: '5,200 EGP',
    images: ['images/discohead-cosplay-mask-egypt.webp', 'images/discohead-cosplay-mask-egypt-2.webp'],
    alt: 'DiscoHead cosplay mask Egypt wearable 3D printed',
    description: 'Wearable DiscoHead cosplay helmet with programmable LED matrix visor, 3D printed and hand-finished in Egypt. Perfect for DJ events, conventions, and futuristic costume builds.',
    specs: [['Lighting', 'RGB LED Matrix'], ['Modes', 'Multi-Mode'], ['Power', 'Built-in Battery'], ['Use', 'DJ & Event Ready']],
    whatsapp: 'Hi, I would like to order the DiscoHead!',
    cta: 'Order Now'
  },
  {
    slug: 'oni-demon-cosplay-mask',
    file: 'oni-demon-cosplay-mask.html',
    title: 'Oni Demon Cosplay Mask (Egypt)',
    schemaName: 'Oni Demon Cosplay Mask Egypt',
    shortName: 'Oni Demon',
    category: 'Japanese',
    cat: 'japanese',
    status: 'In Stock',
    stockClass: 'in-stock',
    availability: 'https://schema.org/InStock',
    sale: true,
    price: '1,299 EGP',
    priceValue: '1299',
    was: '1,600 EGP',
    images: ['images/oni-demon-cosplay-mask-egypt.webp', 'images/oni-demon-cosplay-mask-egypt-2.webp'],
    alt: 'Oni Demon cosplay mask Egypt wearable 3D printed',
    description: 'Wearable Oni demon cosplay mask with traditional design, 3D printed and hand-finished in Egypt. Available in painted variants, perfect for Japanese culture enthusiasts and convention-goers.',
    specs: [['Design', 'Horned'], ['Paint', 'Hand-Painted'], ['Material', 'Lightweight Resin'], ['Display', 'Wall Mount Ready']],
    whatsapp: 'Hi, I would like to order the Oni Demon mask!',
    cta: 'Order Now'
  }
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function abs(asset) {
  return `${SITE}/${asset}`;
}

function waUrl(product) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(product.whatsapp)}`;
}

function productUrl(product) {
  return `products/${product.file}`;
}

function productPageUrl(product) {
  return `${SITE}/${productUrl(product)}`;
}

function card(product) {
  const imagesJson = JSON.stringify(product.images);
  const badge = product.sale ? '        <span class="card-badge">Sale</span>\n' : '';
  const was = product.was ? `<span class="price-was">${esc(product.was)}</span>` : '';
  const specs = product.specs.map(([key, value]) => `
          <div class="spec-item"><div class="spec-key">${esc(key)}</div><div class="spec-val">${esc(value)}</div></div>`).join('');
  return `
    <article class="product-card reveal" data-cat="${esc(product.cat)}" data-url="${esc(productUrl(product))}">
      <div class="card-img" data-images='${esc(imagesJson)}' data-current="0">
        <a class="card-img-link product-card-link" href="${esc(productUrl(product))}" aria-label="View details for ${esc(product.title)}">
          <img src="${esc(product.images[0])}" alt="${esc(product.alt)}" width="600" height="600" loading="lazy">
        </a>
${badge}        <span class="card-cat">${esc(product.category)}</span>
        <span class="card-stock ${esc(product.stockClass)}">${esc(product.status)}</span>
        <button class="img-nav prev" type="button" aria-label="Previous image for ${esc(product.shortName)}">&#8249;</button>
        <button class="img-nav next" type="button" aria-label="Next image for ${esc(product.shortName)}">&#8250;</button>
        <span class="img-counter" aria-live="polite"><span class="img-current">1</span>/<span class="img-total">2</span></span>
      </div>
      <div class="card-body">
        <h3 class="card-name"><a class="product-card-link" href="${esc(productUrl(product))}">${esc(product.title)}</a></h3>
        <p class="card-desc">${esc(product.description)}</p>
        <div class="card-specs">${specs}
        </div>
        <div class="card-footer">
          <div class="card-price"><span class="price-now">${esc(product.price)}</span>${was}</div>
          <a href="${esc(waUrl(product))}" target="_blank" rel="noopener noreferrer" class="btn-order" data-wa="${esc(product.slug)}">${whatsappSvg}${esc(product.cta)}</a>
          <a class="card-detail-link product-card-link" href="${esc(productUrl(product))}" aria-label="View full details for ${esc(product.title)}">View details</a>
        </div>
      </div>
    </article>`;
}

function itemListScript() {
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Forg3d.Art Cosplay Mask Collection',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: productPageUrl(product),
      item: {
        '@type': 'Product',
        name: product.schemaName,
        description: product.description,
        image: abs(product.images[0]),
        url: productPageUrl(product),
        brand: { '@type': 'Brand', name: 'Forg3d.Art' },
        offers: {
          '@type': 'Offer',
          price: product.priceValue,
          priceCurrency: 'EGP',
          availability: product.availability,
          url: productPageUrl(product),
          seller: { '@type': 'Organization', name: 'Forg3d.Art' }
        }
      }
    }))
  };
  return `<script type="application/ld+json">\n${JSON.stringify(list, null, 2)}\n</script>`;
}

function replaceItemList(html) {
  const marker = '"@type": "ItemList"';
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) throw new Error('ItemList JSON-LD block not found');
  const start = html.lastIndexOf('<script type="application/ld+json">', markerIndex);
  const end = html.indexOf('</script>', markerIndex) + '</script>'.length;
  return `${html.slice(0, start)}${itemListScript()}${html.slice(end)}`;
}

function updateIndex() {
  const indexPath = path.join(ROOT, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = replaceItemList(html);
  html = html
    .replace('<div class="hstat-num" data-target="9" data-suffix="">0</div>', '<div class="hstat-num">9</div>')
    .replace('<div class="hstat-num" data-target="5" data-suffix="">0</div>', '<div class="hstat-num">5</div>')
    .replace('<div class="hstat-num" data-target="100" data-suffix="%">0%</div>', '<div class="hstat-num">100%</div>')
    .replace(/\.lightbox-trigger/g, '.card-img-link')
    .replace('cursor: zoom-in;', 'cursor: pointer;')
    .replace('opacity: 0;', 'opacity: 1;')
    .replace('opacity: 0; transition: opacity 0.3s;', 'opacity: 1; transition: opacity 0.3s;')
    .replace('    .hero-stats { display: none; }', `    .hero-stats {
      position: relative; right: auto; top: auto; transform: none;
      flex-direction: row; gap: 12px; width: 100%; margin-top: 34px;
    }
    .hstat {
      flex: 1; text-align: left; border-right: 0; border-left: 2px solid var(--gold);
      padding: 10px 0 10px 14px; background: rgba(201,168,76,0.05);
    }`);

  const start = html.indexOf('  <div class="products-grid">');
  const nextSection = html.indexOf('<section class="trust-bar" style', start);
  const end = nextSection === -1 ? -1 : html.lastIndexOf('</section>', nextSection);
  if (start === -1 || end === -1) throw new Error('products grid block not found');
  const productGrid = `  <div class="products-grid">\n${products.map(card).join('\n')}\n\n  </div>`;
  html = `${html.slice(0, start)}${productGrid}${html.slice(end)}`;
  fs.writeFileSync(indexPath, html);
}

function productSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.schemaName,
    description: product.description,
    image: product.images.map(abs),
    url: productPageUrl(product),
    brand: { '@type': 'Brand', name: 'Forg3d.Art' },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.priceValue,
      priceCurrency: 'EGP',
      availability: product.availability,
      url: productPageUrl(product),
      seller: { '@type': 'Organization', name: 'Forg3d.Art' }
    }
  };
}

function relatedProducts(product) {
  const sameCategory = products.filter(item => item.slug !== product.slug && item.cat === product.cat);
  const fallback = products.filter(item => item.slug !== product.slug && item.cat !== product.cat);
  return [...sameCategory, ...fallback].slice(0, 3);
}

function productPage(product) {
  const pageTitle = `${product.title} | Forg3d.Art`;
  const pageDescription = `${product.description} See gallery, specifications, price, availability, and WhatsApp ordering details.`;
  const relImagesJson = JSON.stringify(product.images.map(image => `../${image}`));
  const thumbs = product.images.map((image, index) => `
          <button class="gallery-thumb${index === 0 ? ' active' : ''}" type="button" data-index="${index}" aria-label="Show image ${index + 1} of ${esc(product.title)}" aria-pressed="${index === 0 ? 'true' : 'false'}">
            <img src="../${esc(image)}" alt="${esc(`${product.shortName} thumbnail ${index + 1}`)}" width="120" height="120" loading="lazy">
          </button>`).join('');
  const specs = product.specs.map(([key, value]) => `
          <div class="product-spec"><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('');
  const related = relatedProducts(product).map(item => `
        <a class="related-card" href="${esc(item.file)}">
          <img src="../${esc(item.images[0])}" alt="${esc(item.alt)}" width="280" height="280" loading="lazy">
          <span>${esc(item.title)}</span>
          <em>${esc(item.price)}</em>
        </a>`).join('');
  const badge = product.sale ? '<span class="product-badge">Sale</span>' : '';
  const was = product.was ? `<span class="price-was">${esc(product.was)}</span>` : '';
  const galleryAlts = product.images.map((_, index) => index === 0 ? product.alt : `${product.alt} - alternate view`);
  const galleryAltsJson = JSON.stringify(galleryAlts);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${esc(pageDescription)}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(pageDescription)}">
<meta property="og:image" content="${esc(abs(product.images[0]))}">
<meta property="og:url" content="${esc(productPageUrl(product))}">
<meta property="og:type" content="product">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(pageTitle)}">
<meta name="twitter:description" content="${esc(pageDescription)}">
<meta name="twitter:image" content="${esc(abs(product.images[0]))}">
<link rel="canonical" href="${esc(productPageUrl(product))}">
<link rel="icon" href="../favicon.ico" type="image/x-icon">
<link rel="apple-touch-icon" href="../forg3dart_small.png">
<link rel="manifest" href="../manifest.json">
<meta name="theme-color" content="#0a0a0a">
<script type="application/ld+json">
${JSON.stringify(productSchema(product), null, 2)}
</script>
<title>${esc(pageTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://wa.me">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css">
</head>
<body class="product-page">
<a href="#main-content" class="skip-to-content">Skip to main content</a>

<nav aria-label="Primary navigation">
  <a href="../index.html" class="logo">Forg3d<em>.</em>Art</a>
  <ul id="primaryNavigation">
    <li><a href="../index.html#collection">Masks</a></li>
    <li><a href="../index.html#craft-process">Craft &amp; Process</a></li>
    <li><a href="../index.html#faq">FAQ</a></li>
    <li><a href="../info.html">Shipping &amp; Info</a></li>
    <li><a href="${esc(waUrl(product))}" target="_blank" rel="noopener noreferrer" data-wa="${esc(product.slug)}">Order</a></li>
  </ul>
  <button class="nav-hamburger" id="navHamburger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primaryNavigation">
    <span></span>
    <span></span>
    <span></span>
  </button>
  <a href="${esc(waUrl(product))}" target="_blank" rel="noopener noreferrer" class="nav-cta" data-wa="${esc(product.slug)}">${esc(product.cta)}</a>
</nav>

<main id="main-content">
  <section class="product-detail">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="../index.html">Home</a>
      <span>/</span>
      <a href="../index.html#collection">Collection</a>
      <span>/</span>
      <span aria-current="page">${esc(product.shortName)}</span>
    </nav>

    <div class="product-layout">
      <div class="product-gallery reveal" data-images='${esc(relImagesJson)}' data-alts='${esc(galleryAltsJson)}' data-current="0">
        <div class="gallery-frame">
          <button type="button" class="gallery-main-button lightbox-trigger" aria-label="Open full-size gallery for ${esc(product.title)}">
            <img class="gallery-main-img" src="../${esc(product.images[0])}" alt="${esc(product.alt)}" width="900" height="900">
          </button>
          <button class="gallery-nav prev" type="button" aria-label="Previous image for ${esc(product.shortName)}">&#8249;</button>
          <button class="gallery-nav next" type="button" aria-label="Next image for ${esc(product.shortName)}">&#8250;</button>
          <span class="gallery-counter" aria-live="polite"><span class="gallery-current">1</span>/<span class="gallery-total">${product.images.length}</span></span>
        </div>
        <div class="gallery-thumbs" role="list" aria-label="${esc(product.title)} thumbnails">
${thumbs}
        </div>
      </div>

      <article class="product-summary reveal">
        <div class="product-kicker">
          ${badge}
          <span class="card-cat static">${esc(product.category)}</span>
          <span class="card-stock ${esc(product.stockClass)} static">${esc(product.status)}</span>
        </div>
        <h1>${esc(product.title)}</h1>
        <p class="product-copy">${esc(product.description)}</p>
        <div class="product-price"><span class="price-now">${esc(product.price)}</span>${was}</div>
        <a href="${esc(waUrl(product))}" target="_blank" rel="noopener noreferrer" class="btn-order product-cta" data-wa="${esc(product.slug)}">${whatsappSvg}${esc(product.cta)}</a>

        <div class="product-info-note">
          <strong>Production and shipping</strong>
          <p>Most standard pieces are completed in 4-7 days. Custom timelines, courier delivery in Egypt, and international shipping are confirmed before order approval. <a href="../info.html">Read shipping and order info</a>.</p>
        </div>

        <h2>Specifications</h2>
        <dl class="product-spec-grid">
${specs}
        </dl>
      </article>
    </div>
  </section>

  <section class="related-products" aria-labelledby="related-title">
    <div class="collection-hd">
      <div class="section-label">Keep Browsing</div>
      <h2 class="section-title" id="related-title">RELATED <span>PIECES</span></h2>
    </div>
    <div class="related-grid">
${related}
    </div>
  </section>
</main>

<div class="mobile-sticky-cta">
  <div>
    <span>${esc(product.price)}</span>
    <small>${esc(product.status)}</small>
  </div>
  <a href="${esc(waUrl(product))}" target="_blank" rel="noopener noreferrer" class="btn-order" data-wa="${esc(product.slug)}">${whatsappSvg}${esc(product.cta)}</a>
</div>

<footer>
  <div class="footer-logo">Forg3d<em>.</em>Art</div>
  <div class="footer-text" style="width:100%;text-align:center;order:5;"><a href="../index.html#collection" style="color:var(--gold);text-decoration:none;">Masks</a> &middot; <a href="../index.html#craft-process" style="color:var(--gold);text-decoration:none;">Craft &amp; Process</a> &middot; <a href="../info.html" style="color:var(--gold);text-decoration:none;">Shipping &amp; Info</a> &middot; Looking for custom gifts? <a href="https://esn3ly.store/" target="_blank" rel="noopener noreferrer" style="color:var(--gold);text-decoration:none;">Visit Esn3ly</a></div>
  <div class="footer-text">&copy; 2026 ALL RIGHTS RESERVED &middot; MADE IN EGYPT</div>
  <div class="footer-text" style="color:var(--gold-dim);">3D PRINT &middot; HANDCRAFTED &middot; ARTIST FINISH</div>
</footer>

<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
  <h2 class="visually-hidden" id="lightbox-title">Product image viewer</h2>
  <button class="lightbox-close" id="lbClose" aria-label="Close lightbox">&times;</button>
  <button class="lightbox-arrow lightbox-prev" id="lbPrev" aria-label="Previous image">&#8249;</button>
  <img id="lightbox-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="">
  <button class="lightbox-arrow lightbox-next" id="lbNext" aria-label="Next image">&#8250;</button>
</div>

<script src="../main.js"></script>
<noscript>
  <div style="text-align: center; padding: 20px; background: var(--panel); color: var(--white);">
    <p>This site works best with JavaScript enabled. Please enable JavaScript to view all features.</p>
  </div>
</noscript>
</body>
</html>
`;
}

function writeProductPages() {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  products.forEach(product => {
    fs.writeFileSync(path.join(PRODUCTS_DIR, product.file), productPage(product));
  });
}

function updateSitemap() {
  const urls = [
    `${SITE}/`,
    `${SITE}/info.html`,
    ...products.map(productPageUrl)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
}

updateIndex();
writeProductPages();
updateSitemap();
