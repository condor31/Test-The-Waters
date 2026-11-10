# TTW v2 Redesign: Inventory & Plan

Branch: `ttw-v2-redesign`, cut from `Streamlined-Page` @ `386d323` (same commit as `main`). `main` stays untouched.

## How this codebase is built

This is a static site with no framework: one `index.html`, one `css/styles.css`, and ES modules in `js/`. Here, a "component" means a markup block in `index.html` plus its CSS and JS hooks. So:

- **Unmounting** a module means removing its markup from `index.html`. To keep the files, the removed markup is copied verbatim into `partials/removed/*.html`. Its CSS rules and JS initialisers stay where they are. Every JS initialiser already checks that its element exists, so nothing breaks once the markup is gone.
- **New modules** are new markup blocks. Their CSS lives in `css/ttw-v2.css` and their JS in `js/ttw-v2.js`, which keeps v2 work separate from the existing files.
- **Placeholder component:** `<div class="ph" data-ph-src="..." data-ph-label="..." data-ph-alt="...">`. `js/ttw-v2.js` probes `data-ph-src` and swaps in a real `<img>` once the file exists. See `TTW_ASSETS.md`.

## Inputs used

| Input | Status |
|---|---|
| Prompt copy/specs | Used verbatim (with the 4 listed typo fixes) |
| Wireframe `NEW_TTW Wireframe.pdf` | Found in `~/Downloads/`. Used for module order, KEEP screenshots and press outlet names |
| Figma `467:328` | **Not reachable in this session.** No Figma MCP tools were exposed to the agent. The existing tokens in `css/styles.css` were originally pulled from the same Figma file (node `4:348`), so they are used as-is. See report. |
| Existing codebase | Source of truth for KEEP modules |

## New module order → status → source

| # | Module | Status | Maps to (existing) | New markup id |
|---|---|---|---|---|
| 1 | Hero + background reel | NEW (reuses `.hero` shell, bg-video toggle JS) | `header.hero` (`index.html` L38–141), `initHeroBackgroundVideo()` | `header.hero.hero--v2` |
| 2 | Hero copy + Brand Anthem | REWORK | Hero H1 replaced. Video facade pattern from `#hero-video-player` / `initHeroVideoPreview()` (video ID `TXxys99LGoM`) | H1/subhead/CTA/disclaimer in hero; `#brand-anthem` band |
| 3 | Celebrities marquee | NEW | none | `#celebrities` |
| 4 | Partner logos | KEEP + new heading | `.partner-logos-section` (L884–965), grid only | `#partners` |
| 5 | Reuse Loop | NEW | none (borrows the brand yellow loop/arrow language from `.loop-diagram-svg`) | `#reuse-loop` |
| 6 | What's Inside (5 cards) | KEEP + new heading + subhead + CTA | `.os-carousel-wrap` (L967–1029) | `#whats-inside` |
| 7 | Social Proof | NEW grid + KEEP testimonial | `figure.partner-quote` (L947–963) moved here | `#social-proof` |
| 8 | Where We Go Next | NEW | pink arrow `public/assets/f525cc1a….svg` (#FF0099, the existing magenta slide-arrow shape) | `#where-next` |
| 9 | State Legislation | KEEP map + new heading | `#how-it-works` map wrapper + legend (L193–515) | `#how-it-works` (id kept for map JS) |
| 10 | Why It Matters | KEEP 3 tiles + new heading + NEW tile + NEW benefit grid | `.impact-stripe` tiles fn8 / fn10 / fn11 (L526–548) | `#why-it-matters` |
| 11 | Press | KEEP logos + new heading (**see note**) | **No press logo grid exists in this repo** (checked `index.html`, `snapshot/`, `main`, `compliance-edits` and git history). Built new from the wireframe's 8 outlets with placeholders | `#press` |
| 12 | Use of Proceeds | REWORK (3 cards) | `.jobs-panel` + `.jobs-band` + `.jobs-disclaimer-pill` (L1031–1053) | `#use-of-proceeds` |
| 13 | Next Steps | KEEP | `#whats-next` (L1272–1292) | unchanged |
| 14 | Final CTA | KEEP form + new heading | `#interested-form` / `#interest-form` (L1295–1389) | unchanged ids (all CTAs anchor here) |
| 15 | Footer | KEEP | `footer.site-footer` (L1428–1457) | unchanged |

### Global chrome kept (not listed as modules, but needed)
- `.announcement-bar`: the compliance banner. Kept.
- `#sources-section`: the global Sources list. Kept, because the KEEP tiles (fn8/10/11), map and OS cards (fn28) all link to it.
- `#persistent-cta`: the sticky CTA bar that links to `#interested-form`. Kept.

## Modules currently on the page that are NOT in the new order (to unmount, files kept)

| Current module | Location | Archived to |
|---|---|---|
| Old hero heading ("Coming soon to StartEngine" eyebrow + old H1) | L53–57 | `partials/removed/01-hero-old.html` |
| Hero interest card: intro copy, **hero form `#hero-interest-form`**, success state, video thumbnail/player | L59–140 | `partials/removed/01-hero-old.html` |
| Slide-arrow cyan ("Don't just divert waste…") | L145–154 | `partials/removed/02-slide-arrows.html` |
| Slide-arrow magenta ("Only 9% of plastic…") | L156–163 | `partials/removed/02-slide-arrows.html` |
| Slide-arrow yellow ("Single-use waste recycling isn't…" + mid-page CTA) | L165–191 | `partials/removed/02-slide-arrows.html` |
| How-it-works old H2 + intro paragraph (map kept) | L195–197 | `partials/removed/03-how-it-works-heading.html` |
| "Check out r.World's real-world impact" heading + 5 of 8 impact stripes + carousel dots (3 stripes reused in M10) | L517–586 | `partials/removed/04-impact-carousel.html` |
| Closed-loop / open-loop section + 3 loop diagrams | L588–845 | `partials/removed/05-closed-open-loop.html` |
| "Why r.World? Why Now?" | L847–882 | `partials/removed/06-why-now.html` |
| Partner logos: old H2/eyebrow/lead (grid kept; quote moved to M7) | L886–890 | `partials/removed/07-partner-header.html` |
| OS section old H2 | L969 | `partials/removed/08-os-heading.html` |
| "How r.World plans to use the funds" panel + 2 old cards | L1031–1048 | `partials/removed/09-use-of-funds-old.html` |
| Leadership & Board carousel | L1056–1270 | `partials/removed/10-leadership.html` |
| Final CTA old heading ("Want to be the first to know…") | L1298 | (single line; noted in report) |

## Build order
1. Archive the removed markup to `partials/removed/`.
2. Rewrite `index.html` in the new order.
3. Add `css/ttw-v2.css` and `js/ttw-v2.js` (Placeholder, marquee, loop highlight, anthem autoplay, stat cycler).
4. Write `TTW_ASSETS.md`.
5. Run Playwright QA: screenshots, copy diff, CTA anchors, reduced motion, console, overflow at 375.
6. Write `TTW_V2_REPORT.md`.

