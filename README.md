# Forg3d.Art — Cosplay Masks & Helmets

[Forg3d.Art](https://forg3d.art) is an English-first static storefront for wearable 3D printed cosplay masks and helmets handcrafted in Egypt. Orders are handled through WhatsApp, with delivery across Egypt and international shipping by quotation.

Custom gifts have moved to [Esn3ly](https://esn3ly.store/). The old Forg3d.Art gift catalog, guides, and portfolio are permanently redirected there through 27 Cloudflare Workers Static Assets `_redirects` rules. A separate internal 200 proxy keeps `/` mapped to `index.html` while `/info.html` remains a direct 200.

## Retained site

- `/` and `/index.html` — mask collection, process, FAQ, and WhatsApp ordering
- `/info.html` — production, shipping, returns, care, payment, and privacy
- `/404.html` — custom not-found page
- `manifest.json` and `sw.js` — installable, offline-capable cosplay shell
- Strict analytics opt-in — Google Analytics is not requested before acceptance

## Local QA

The production site has no runtime dependencies. Node is used only to provide repeatable QA commands.

```sh
npm ci
npm test
```

`npm test` runs the zero-dependency Python checker and `node --check` for `main.js` and `sw.js`. The checker validates retained routes, links, fragments, image and carousel sources, JSON-LD, page landmarks and metadata, safe new-tab links, the sitemap, service-worker precache, all 27 redirect rules, and the absence of retired gift resources.

GitHub Actions runs the same commands on pushes and pull requests with Python 3.12 and Node 22.

For a quick local preview:

```sh
python -m http.server 8000
```

Cloudflare redirect behavior must be verified in a Workers preview or deployment because a basic Python server does not process `_redirects`.

## Deployment notes

The site is configured as a Cloudflare Workers Static Assets project in `wrangler.jsonc`. Keep the retired route mappings in `_redirects` indefinitely. After a tested rollout, submit the reduced `sitemap.xml` in Google Search Console and monitor redirect coverage, mask impressions, and Esn3ly referral traffic.
