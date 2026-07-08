# Forg3d.Art — 3D Printed Cosplay Masks & Custom Gifts, Egypt

[![Live Site](https://img.shields.io/badge/Live%20Site-forg3d.art-gold)](https://forg3d.art)

Premium 3D printed cosplay masks, helmets, and personalized gifts — handcrafted in Egypt.

## 🎭 Cosplay Masks

9 masks across 5 categories: Superhero, Sci-Fi, Fantasy, Villain, Japanese.  
Prices: 999–3,800 EGP.

## 🎁 Custom Gifts

9 products across 5 categories: Name Tags, Family Gifts, Couple Gifts, Islamic Decor, Desktop.

| Product | Category | Price |
|---------|----------|-------|
| Customizable Name Tag | Name Tags | 149 EGP |
| Personalized Family Sign | Family Gifts | 299 EGP |
| Couple / Valentine Gift | Couple Gifts | 299 EGP |
| Initials with Heart | Couple Gifts | 299 EGP |
| Parametric Lithophane Text | Wall Art | 299 EGP |
| Alhamdulillah Calligraphy Stand | Islamic Decor | 899 EGP |
| Subhanallah Calligraphy Stand | Islamic Decor | 899 EGP |
| Letter Decor Designer | Desktop | 159 EGP |
| Surah Al Kafiroon Wall Art | Islamic Decor | 3,599 EGP |

Arabic & English engraving available. Orders placed via WhatsApp form.

## 🛠️ Tech Stack

- Shared CSS (`styles.css`) & JS (`main.js`) across pages
- Zero dependencies, zero build tools
- **PWA** — installable via `manifest.json` + offline-capable service worker (`sw.js`)
- Custom 404 error page (`404.html`)
- Google Analytics 4 (GA4) with **Consent Mode** — analytics load only after opt-in; conversion tracking on all WhatsApp clicks
- Schema.org structured data (Organization + `sameAs`, Product, FAQPage, ItemList, BreadcrumbList, LocalBusiness)
- Lightbox image viewer with keyboard navigation & focus trap
- Back-to-top button, hamburger mobile menu (all pages), scroll-reveal animations
- Cookie-consent banner, optimized/compressed imagery (~72% smaller)
- CI: automated link/id/metadata QA + HTML validation on every push (`.github/workflows/qa.yml`)

## 📦 Project Structure

| File | Purpose |
|------|--------|
| `index.html` | Cosplay masks landing page |
| `custom-gifts.html` | Custom gifts page with order form |
| `guides.html` | Gift-guides hub linking all 6 guides |
| `guide-*.html` | 6 SEO gift guides (birthdays, weddings, corporate, couples, islamic, diaspora) |
| `portfolio.html` | Testimonials & case studies |
| `info.html` | Shipping, returns, privacy & ordering info |
| `styles.css` | Shared CSS (variables, layout, components, consent banner) |
| `main.js` | Shared JS (SW registration, lightbox, hamburger, WhatsApp tracking, consent, back-to-top) |
| `sw.js` | Service worker (offline shell caching) |
| `manifest.json` | PWA manifest |
| `404.html` | Custom error page |
| `favicon.ico` | Favicon · `icon-192/512.png`, `icon-maskable-512.png` | PWA icons |
| `logo.png` | Brand logo (400×400) |
| `forg3dart_512.png` | OG image (512×512) |
| `sitemap.xml` | XML sitemap |
| `robots.txt` | Crawler rules |
| `scripts/qa_check.py` | Zero-dependency QA checker (`python3 scripts/qa_check.py`) |
| `.github/workflows/` | CI: QA + HTML validation, optional GitHub Pages deploy |

### Images

- Mask images: `/images/` — 2 images per product, WebP/JPEG/PNG
- Gift images: `/images/gifts/` — product photos (JPG/GIF)

## 📞 Order

All orders via WhatsApp: [+20 109 667 7140](https://wa.me/201096677140)  
Cairo — Egypt · Orders ship nationwide