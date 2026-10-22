# Migration Report: insuringyouforless.com → new static site

Crawled October 22, 2026. All numbers come from files in `migration/` and can be regenerated with the `npm run migrate:*` scripts.

## 1. What was captured

| | English | Spanish (/es-us/) |
|---|---|---|
| URLs crawled (live, 200) | 445 | 445 |
| URLs that failed or 404'd (dead links, template junk) | 443 | 442 |
| Unique pages after removing duplicate URLs | 424 total (356 URLs were aliases of the same page, e.g. `/about.aspx` = `/about/`) | |
| Text items in `content-inventory.json` | 14,701 | 14,857 |
| Blog posts | 120 | 0 (the old Spanish blog was the English one) |
| Glossary terms (A–W; X/Y/Z were empty) | 401 | 401 (English text) |
| Staff profiles | 7 | — |
| Testimonials (102 reviews, average 5.0) | 102 | — |

- Wayback Machine fallback: not needed; every important page was live.
- Data loaded by JavaScript on the old site was captured from its JSON endpoint (`website_data.ashx`): staff, offices with GPS coordinates, all 102 testimonials and product lines. The **staff emails only existed inside the vCards** (the old site showed them as images); they are now real text.
- The crawl was stopped once all content pages were captured. Some blog tag-archive and pagination URLs were not crawled; they only repeat post excerpts, which are all captured from the posts themselves.

## 2. Logo and favicon

- Source: `/img/~www.insuringyouforless.com/layout-assets/logo.png`, **178 × 107 px PNG**. This is the only version that exists. Wayback snapshots from 2022–2024 are the identical file, and no larger versions or SVG exist on the server.
- ⚠️ **Too small for a premium site.** It is shown at native size or slightly larger, always on a white plate (its thin red lettering has a white edge). The 180/192/512 px app icons and the 1200 × 630 Open Graph image are upscaled. **[CONFIRM WITH CLIENT] Please send a vector (SVG/AI/EPS) or a PNG at least 1000 px wide.**
- Old favicon saved as `migration/old-favicon.ico` (16 × 16).
- New icon set uses the full logo, uncropped (`src/app/favicon.ico` 16/32/48, `icon.png`, `apple-icon.png`, `public/icon-192/512.png`, maskable icon, `site.webmanifest`). Previews are in `migration/favicon-previews/`. The "AIA mark only" option was tested, but any crop cuts through the curved lettering, so it was not used.

## 3. Images

- 438 references found: **120 downloaded**, 1 duplicate, 11 skipped (UI arrows/spacers/sprites), 306 not downloadable. Plus **33 images that were pasted into blog posts as inline base64 data**; these were extracted to real files (`public/images/blog/*-inline-*`).
- Renamed meaningfully into `public/images/{photos,blog,carriers,icons,brand}/`, with WebP versions at 2–3 sizes (never upscaled). AVIF can be added with `AVIF=1 npm run migrate:images`; it was skipped because it is too slow for this machine.
- What the photos show: 5 hero photos at 1920 px (woman and dog in a car, family at home, RV by a lake, man driving at sunset, people on a speedboat), the **Murfreesboro and Smyrna office photos (only 300 px wide, low-res)**, the Town of Smyrna seal, the TN Department of Safety seal, a red-car background, and a handshake background (kept in the archive, not displayed, because the brief rules out stock handshake photos).
- **Not downloadable / not used** (pending your approval to omit):
  - 154 × `chart.googleapis.com` (QR-code images from the old template; that Google API is dead)
  - ~93 × `/images/AutoImages/*`, `/images/HomeImages/*`, `/images/AddLobImages/*` (SVG icons inside the old on-site quote-form widget; they now return redirects)
  - 14 × staff photo URLs (`employee_photo.dynimage`) all return 404: **the old site had no staff photos**, so the new site shows "Photo coming soon" monogram placeholders. **[CONFIRM WITH CLIENT] Staff photos needed.**
  - Broken images inside blog posts: 2 expired Getty thumbnails, 1 iStock hotlink, and 1 `file:///C:/Users/Jeff/...` path pasted from Word (Tennessee Insurance Laws post).
- Text inside images, transcribed: the staff email images (now text from the vCards), the "Resources" page screenshots ("Tennessee expected to grow by 1 million people next 20 years, mostly in Nashville region"; "New Bill Would Gut Conservation Funding"), and the "TN Department of Safety" and "Town of Smyrna, Tennessee 1869" seals.
- The old clip-art product icons (`lob_btn_01–05`, `icon1–3`, `3ways_1–3`) are kept in `public/images/icons/legacy-*` and **replaced** in the design by a custom monoline icon set (`src/components/ui/Icons.tsx`).

## 4. Where the content went

| Old content | New location |
|---|---|
| Home text, 3 value points, 3 ways, featured carriers, testimonials, blog teaser | `/` (Hero, Story, ThreeWays, Carriers, Testimonials, BlogPreview) |
| Product pages (auto, commercial, motorcycle, homeowners, renters, boat, RV, business, rental property) | same URLs, full original text |
| SR-22, TN Driver's License Reinstatement (`/category.aspx?id=MISC1`) | `/sr_22/`, `/content/tn-drivers-license-reinstatement/` + home SR-22 section |
| About, Privacy, Resources, area pages (Smyrna, La Vergne, Antioch, Nashville, Hendersonville, Murfreesboro, "Welcome to Smyrna", `/tn/is-gap-coverage…`) | same paths (folder style) |
| Employee directory + 7 profiles + contact forms | `/employees/`, `/employees/<name>/` (+ static vCards in `/vcards/`) |
| Locations (+ each office, hours, staff) | `/locations/`, `/locations/murfreesboro/`, `/locations/smyrna/` |
| Contact form, Refer a Friend form | `/contact/`, `/refer/` (mailto forms with the same fields + preferred office/language) |
| Carriers (`/links.aspx`), Payments, Claims | `/carriers/`, `/payments/`, `/claims/` (every phone number and URL kept) |
| Quote forms | `/get_a_quote/` + external quote links |
| Blog (120 posts, tags, pagination) | `/blog/`, `/blog/<slug>/`, `/blog/<n>/`, `/blog/tag/<tag>/`, `/blog/rss.xml` |
| Glossary A–Z (401 terms) | `/glossary/` (all terms + search) and `/glossary/<letter>/` |
| YouTube video | Home "Watch our video" (click-to-load) |
| Everything above in Spanish | `/es-us/…` (see section 6) |

Omitted as allowed by the brief: the "Powered by Insurance Website Builder" badge, UI arrows/spacers, the old copyright line, dead links, and the old "Secured by SSL" badge (it referred to the old provider's payment form).

## 5. Old URLs → new URLs

`migration/redirects.csv` lists every old URL (`npm run migrate:redirects`). Ready-made redirect files for whichever host is chosen later are in `migration/redirects/` (`_redirects`, `vercel.json`, `.htaccess`, plus HTML fallback stubs). Key rules:

- Folder URLs are mirrored exactly (`/about/`, `/sr_22/`, `/automobile/`, `/glossary/a/`, `/es-us/…`).
- `.aspx` pages → clean folders (`/blog/x.aspx` → `/blog/x/`, `/about.aspx` → `/about/`, `/links.aspx` → `/carriers/`).
- `/category.aspx?id=MISC1` → `/content/tn-drivers-license-reinstatement/`
- `/profile/<name>.aspx`, `/contact/<name>.aspx` → `/employees/<name>/`
- Old on-site quote forms (`/…/insurance_quote.aspx`) → `/get_a_quote/#<product>`; the auto form goes to the external quote.
- `/employee_vcf.aspx?agent=…` → `/vcards/<id>.vcf`
- `/blog/rss/`, `/blog/atom/` → `/blog/rss.xml`

## 6. Spanish

- Real Spanish text existed only for the home page, 6 product pages (auto, motorcycle, homeowners, renters, boat, RV), claims, business and the office pages. Those are used **verbatim**.
- Everything else on the old Spanish site was English, or just a Spanish heading with no body. The new `/es-us/` pages show the English original with a notice: "Este contenido está disponible solo en inglés en este momento."
- New Spanish UI copy and section text is marked `// [REVIEW TRANSLATION]` in `src/lib/i18n.ts` and in the components.

## 7. Flags for the client

**Inconsistencies and errors on the old site**
- [ ] **TAIA vs TNAIA**: the About page says "TAIA", the home page says "TNAIA". The logo reads "TAIA". Which abbreviation is correct?
- [ ] **"20 years"** (home, Smyrna pages) is outdated. The new site computes years from 1998 automatically.
- [ ] **Hours conflict**: the visible pages say Mon–Fri 8:30–5:30 at both offices, but the old site's hidden structured data says 9:00–5:00 plus Saturday 8:30–5:30 in Murfreesboro. The new site uses 8:30–5:30, Monday to Friday.
- [ ] **The Spanish footer shows an old Murfreesboro address: "205 NW Broad St"**. The new site uses 925 S Church St., Suite A300 everywhere.
- [ ] The Spanish home page says "**cientos** de clientes" (hundreds), where the English says "**thousands**".
- [ ] The Spanish home page mentions **life insurance** ("seguro de vida"), which looks like template boilerplate. It was not used.
- [ ] Machine-translation errors on the Spanish site: "Automático" (Auto), "Antioquía" (Antioch), "Symrna", "transportistas/portadores" (carriers).
- [ ] Typos fixed in displayed text only (originals kept): Symrna → Smyrna, La Verge → La Vergne, "you driver's license" → "your driver's license".
- [ ] `/tn/is-gap-coverage-right-for-you/` actually contains the Murfreesboro auto-insurance text (the URL doesn't match the content).
- [ ] `/rental_property/` has the page title "Auto Insurance Quote".
- [ ] The "Get a Quote Today!" links on some pages point to `http://https//…` (broken); fixed to `https://`.

**Carriers**
- [ ] "Auto Advantage" payments use the **Mendota Insurance** logo.
- [ ] Trexis: claims phone 1-877-**884**-7466 vs payments phone 1-877-**784**-7466.
- [ ] Gainsco payment phone is incomplete on the old site ("1-866-").
- [ ] Old `/links.aspx` sends First Acceptance to an insure.com review page; the claims page sends it to acceptanceinsurance.com.
- [ ] The brief lists "Advantage Auto"; the site says "Auto Advantage".

**Other items to confirm or supply**
- [ ] **High-res or vector logo** (most important).
- [ ] **Staff photos** (none exist).
- [ ] **ATV page**: no ATV page existed (ATV is only listed on About). A placeholder page is at `/atv/`.
- [ ] LinkedIn: the old link was an `/admin/` URL; replaced with `https://www.linkedin.com/company/11338281/`.
- [ ] Toll-free number "1-877-Auto599" (license reinstatement page): still active?
- [ ] Testimonials mention a "Daniel", who is not on the current staff list. The reviews are kept verbatim.
- [ ] Higher-resolution office photos (currently 300 px wide).
- [ ] Online quotes exist only for auto and property/renters. Other products use a mailto request plus a phone call. Do online quote links exist for the other products?
