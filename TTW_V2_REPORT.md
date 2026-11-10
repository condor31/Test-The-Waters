# r.World TTW Page — Redesign Build (v2) Report

**Branch:** `ttw-v2-redesign` (cut from `Streamlined-Page` @ `386d323`). `main` remains untouched.  
**Build Scope:** Complete, working first build of the redesigned Test the Waters (17 CFR § 227.206) landing page according to the v2 module order and verbatim copy specifications.

---

## 1. Module Inventory & Status

| # | Module Name | Status | Component / Markup | Implementation Details & Status |
|---|---|---|---|---|
| **1** | Hero + Background Reel | **NEW** | `header.hero.hero--v2`, `css/ttw-v2.css`, `js/ttw-v2.js` | Full-bleed looping video (`public/assets/ttw/hero-reel.mp4`) with poster fallback, dark gradient scrim, accessible pause/play toggle, and live 4-stat cycling counter (`30M DRINKS SERVED`, `150+ CITIES`, `30+ STATES`, `10,000+ LIVE EVENTS`). |
| **2** | Hero Copy + Brand Anthem Video | **REWORK** | `index.html` (L58–104), `section#brand-anthem`, `css/ttw-v2.css` | Verbatim H1 and Subhead, "GET ON THE LIST" CTA button, Rule 206 compliance disclaimer directly below CTA. Brand Anthem video band with YouTube iframe facade (`TXxys99LGoM`) with muted autoplay when scrolled into view. |
| **3** | Celebrities Marquee | **NEW** | `section#celebrities`, `css/ttw-v2.css`, `js/ttw-v2.js` | Verbatim H2 and body. Continuous infinite horizontal photo marquee with 7 celebrity cards, lower-left name overlays, pause on hover/focus, keyboard arrow controls, pause/play motion button, and "JOIN NOTIFICATION LIST" CTA. |
| **4** | Partner Logos | **KEEP + new heading** | `section#partners`, `index.html` (L176–241) | Verbatim H2 and subhead. Reuses existing 18-logo partner grid from `.partner-logos-section`. Quote uncoupled and relocated to Module 7. |
| **5** | Reuse Loop | **NEW** | `section#reuse-loop`, `css/ttw-v2.css`, `js/ttw-v2.js` | Verbatim H2 and subhead. 4-node circular reuse diagram (Pour → Return → Clean → Reuse) with SVG connecting directional arcs and traveling highlight animation. Stacks cleanly into vertical flow on mobile. Accessible motion toggle included. |
| **6** | What's Inside | **KEEP + new heading** | `section#whats-inside`, `index.html` (L297–369) | Verbatim H2 and subhead. Reuses existing 5-card operating system carousel (Logistics, Sanitization, Automation, Technology, Service) and includes "JOIN THE NOTIFICATION LIST" CTA button. |
| **7** | Social Proof Grid & Testimonial | **NEW grid + KEEP testimonial** | `section#social-proof`, `index.html` (L371–463) | Verbatim H2 and subhead. 4×2 venue card grid (Sphere, Red Rocks Amphitheatre, Merriweather Post Pavilion, SAP Center, Crypto.com Arena, CHS Field, LA Memorial Coliseum, TPC Twin Cities) with `X,XXX cups returned` placeholders. Reuses existing Santa Barbara Bowl testimonial quote by Eric Shiflett. 3 footnotes with superscripts linked. |
| **8** | Where We Go Next | **NEW** | `section#where-next`, `css/ttw-v2.css` | Verbatim H2 and body. 3 cards: Healthcare, Corporate & College Campuses, Travel & Hospitality. Incorporates existing brand magenta arrow graphic (`#FF0099`). |
| **9** | State Legislation | **KEEP map + new heading** | `section#how-it-works`, `index.html` (L495–821) | Verbatim H2 and subhead. Reuses existing interactive US legislation SVG map, wash hub markers, tooltip triggers, and legend (`js/map-config.js`). |
| **10** | Why It Matters | **KEEP tiles + new heading + NEW tile** | `section#why-it-matters`, `index.html` (L823–873) | Verbatim H2 and subhead. Reuses existing 3 impact tiles (single-use items, tons of waste, gallons of water) with numbers/sources unchanged. Adds 4th yellow tile: `More than 1M pounds of CO2` / `never generated`. Adds `Reuse Pays for Itself and Then Some` H3 and 2×2 benefit cards grid. |
| **11** | Press | **KEEP + new heading (NEW markup)** | `section#press`, `css/ttw-v2.css` | Verbatim H2 and subhead. Note: No existing press component was found in repo; created 8-outlet logo grid (Yahoo Finance, Packaging World, Pollstar, Billboard, The Washington Post, The Hollywood Reporter, Newsweek, Fast Company) from wireframe screenshot. |
| **12** | Use of Proceeds | **REWORK (3 cards)** | `section#use-of-proceeds`, `index.html` (L897–931) | Verbatim H2 and subhead. 3 cards: More Sanitization Centers, Deeper Automation, Potential for New Categories. Italic SEC filing disclaimer below cards. |
| **13** | Next Steps | **KEEP** | `section#whats-next`, `index.html` (L933–953) | Reuses existing "Ok, Cool. What Happens Now?" 4-step list, concert crowd photo, and yellow swirl arrow. |
| **14** | Final CTA | **KEEP form + new heading** | `section#interested-form`, `index.html` (L955–1049) | Verbatim H2: `Ready to Help r.World Crush It Some More?`. Form fields, radio amount pills, Mailchimp + Google Sheets integration, validation, and Rule 206 disclaimer kept verbatim. Target anchor for all page CTAs. |
| **15** | Footer | **KEEP** | `footer.site-footer`, `index.html` (L1089–1119) | Kept verbatim: leadership call CTA, Rule 206 legal disclaimer, contact email, copyright, and SVG brand logo mark. |

---

## 2. Modules Removed From the Page (Unmounted, Files Kept)

All removed sections have been extracted and archived in `partials/removed/` for safe keeping:
- `partials/removed/01-hero-old.html`: Old hero heading ("Coming soon to StartEngine" eyebrow + old H1), hero interest card with duplicate inline form, and embedded video preview.
- `partials/removed/02-slide-arrows.html`: Cyan slide arrow ("Don't just divert waste. Eliminate it."), Magenta slide arrow ("Only 9% of plastic waste is recycled globally."), Yellow slide arrow ("Single-use waste recycling isn't what you think it is" + mid-page CTA).
- `partials/removed/03-how-it-works-heading.html`: Old "The nation wants reuse..." H2 and lead paragraph preceding the map.
- `partials/removed/04-impact-carousel.html`: Old "Check out r.World's real-world impact" heading and 5 of the 8 metric stripes (the other 3 were preserved and moved to Module 10).
- `partials/removed/05-closed-open-loop.html`: Old Closed Loop / Open Loop section and 3 SVG diagram cards.
- `partials/removed/06-why-now.html`: "Why r.World? Why Now?" section and 4 info-cards.
- `partials/removed/07-partner-header.html`: Old partner section header eyebrow and lead text.
- `partials/removed/08-os-heading.html`: Old OS heading ("One proprietary operating system with five key parts...").
- `partials/removed/09-use-of-funds-old.html`: Old 2-card "How r.World plans to use the funds" cards.
- `partials/removed/10-leadership.html`: Old "Leadership Built for the Industries We Serve" 15-person carousel.
- `partials/removed/11-final-cta-old-heading.html`: Old final CTA heading ("Want to be the first to know when the raise goes live?").

---

## 3. Placeholders & Asset Manifest

Complete asset catalog is documented in [`TTW_ASSETS.md`](./TTW_ASSETS.md). Key placeholders currently rendered:
- **Hero Background Reel:** `/assets/ttw/hero-reel.mp4` & poster `/assets/ttw/hero-reel-poster.jpg` (wired to working fallback).
- **Celebrities (7 slots, 4:5):** `/assets/ttw/celebs/{pedro-pascal, streep-short, dicaprio, flea, gomez-blanco, jack-johnson, seehorn}.jpg`.
- **Reuse Loop (4 slots, 1:1):** `/assets/ttw/loop/{pour, return, clean, reuse}.jpg`.
- **Social Proof Venues (8 slots, 4:3):** `/assets/ttw/venues/{sphere, red-rocks, merriweather, sap-center, crypto-com-arena, chs-field, la-coliseum, tpc-twin-cities}.jpg`.
- **Where We Go Next (3 slots, 4:5):** `/assets/ttw/next/{healthcare, campuses, travel-hospitality}.jpg`.
- **Press Outlets (8 slots, 5:2):** `/assets/ttw/press/{yahoo-finance, packaging-world, pollstar, billboard, washington-post, hollywood-reporter, newsweek, fast-company}.png`.

---

## 4. Copy Conflicts With Old Global Standards

The new copy supersedes previous editorial standards. Below is the itemized list of conflicts with old rules:

1. **Rule violated: No first-person pronouns ("we / us / our"):**
   - Module 2 Subhead: *"We've been crushing single-use waste with a nationwide movement toward reuse. Help us crush it more."*
   - Module 3 H2: *"The Biggest Names in Sports and Entertainment Drink With Us"*
   - Module 4 H2: *"You've Probably Seen Us Live"*
   - Module 10 Benefit Card 3: *"We design each program to make the numbers work."*
   - Module 10 Benefit Card 4: *"We're driving costs down every year toward single-use parity."*
   - Module 11 Subhead: *"Some of the nation's top media outlets have covered our work on the ground."*
2. **Rule violated: No "venue" terminology:**
   - Module 4 Subhead: *"...iconic concert venues..."*
   - Module 7 Subhead: *"High-volume venues with massive crowds."*
3. **Rule violated: "Single-use waste" instead of "single-use plastic":**
   - Reused Santa Barbara Bowl quote (Eric Shiflett): *"...single-use plastic cups..."* (historical direct quote preserved).
4. **Rule violated: Serial commas / AP numeral rules:**
   - Module 10 H2: *"Facilities, People and Planet"* (no Oxford comma).
   - Module 10 Subhead: *"...and the environment, saves cost on disposables and helps users..."*
   - Module 10 Benefit Card 2: *"...sales lift, sponsorships on every cup, and a sustainability fee."* (includes Oxford comma).

---

## 5. CTA Label Inconsistencies

Per module specifications, button labels vary across the page:
- **Module 2 (Hero):** `GET ON THE LIST`
- **Module 3 (Celebrities):** `JOIN NOTIFICATION LIST`
- **Module 6 (What's Inside):** `JOIN THE NOTIFICATION LIST`
- **Module 14 (Final Form submit):** `Join the Notification List`
- **Sticky Persistent Bar:** `Join the Notification List`

*All buttons consistently link and scroll to `#interested-form`.*

---

## 6. Figma Deviations & Layout Notes

- **Figma Reachability:** Figma MCP tools were not exposed in this environment. Layout, type scale, colors, and spatial composition were reconciled with existing brand tokens from `css/styles.css` (originally derived from Figma frame `4:348`) and the wireframe PDF screenshots.
- **Hero Stats:** Stacked large-type card layout with clean left-border emphasis and yellow accent highlighting on loop.
- **Reuse Loop:** Formed with circular node cards and continuous SVG directional arcs with a traveling accent highlight.
- **Where We Go Next Arrow:** Utilizes the existing brand magenta arrow SVG (`public/assets/f525cc1ae2d374e515a07e53cd50020a3adcfe92.svg`) layered behind the 3 cards.
- **Press Outlets:** As no press grid previously existed in the repository, an 8-outlet responsive grid was created following the wireframe reference.

---

## 7. `TODO(connor)` Items

1. [`index.html#L38`](file:///Users/connorblacksher/Documents/GitHub/Test-The-Waters/index.html#L38): Verify Hero stats typography and box spacing against final Figma node `467:328`.
2. [`index.html#L125`](file:///Users/connorblacksher/Documents/GitHub/Test-The-Waters/index.html#L125): Card proportions set to 4:5 portrait; confirm against Figma. Confirm individual celebrity photo alt texts upon asset delivery.
3. [`index.html#L250`](file:///Users/connorblacksher/Documents/GitHub/Test-The-Waters/index.html#L250): Reuse loop SVG utilizes existing brand circular motif; swap for dedicated design asset if one is created in Figma.
4. [`index.html#L377`](file:///Users/connorblacksher/Documents/GitHub/Test-The-Waters/index.html#L377): `X,XXX cups returned` are literal placeholders; replace with verified operational numbers when approved.
5. [`index.html#L441`](file:///Users/connorblacksher/Documents/GitHub/Test-The-Waters/index.html#L441): Footnote 3 for TPC Twin Cities is marked `[TODO: footnote pending]` per wireframe doc.
6. [`index.html#L471`](file:///Users/connorblacksher/Documents/GitHub/Test-The-Waters/index.html#L471): Confirm placement and rotation of the pink arrow in "Where We Go Next".
7. [`index.html#L848`](file:///Users/connorblacksher/Documents/GitHub/Test-The-Waters/index.html#L848): CO2 stat tile uses temporary inline cloud icon; replace with official brand icon if available. Add source citation if required by compliance.
8. [`index.html#L880`](file:///Users/connorblacksher/Documents/GitHub/Test-The-Waters/index.html#L880): Confirm whether press outlet logos should be plain logos or link out to external press coverage articles.
9. [`index.html#L904`](file:///Users/connorblacksher/Documents/GitHub/Test-The-Waters/index.html#L904): Use of Proceeds card layout follows wireframe (2 top cards + 1 full-width card); reconcile against Figma frame.

---

## 8. Dependencies Added

**None.**  
All animations, carousels, marquees, video controllers, and responsive interactions were built strictly using vanilla CSS and native JavaScript without introducing any new external npm packages or runtime dependencies.

---

## 9. Verification & QA Summary

- **Screenshots:** All captured at 1440 and 390 (plus per-module captures) and saved to [`ttw-v2-screens/`](./ttw-v2-screens/).
- **Copy Accuracy:** Automated script [`qa/diff_check.js`](./qa/diff_check.js) confirmed **all 80 text strings match verbatim** (including the 4 approved typo corrections).
- **CTA Anchors:** All CTA buttons successfully target `#interested-form`.
- **Form Integrity:** Mailchimp/Google Sheets payload generation, honeypot, validation, and confirmation states remain intact.
- **Accessibility & Compliance:**
  - Single `<h1>` on page.
  - Rule 206 disclaimer present directly beneath hero CTA and inside footer.
  - Zero console errors and zero page errors.
  - Zero horizontal overflow at 375px (`scrollWidth === clientWidth === 375px`).
  - `prefers-reduced-motion` suppresses auto-scrolling and transitions.

