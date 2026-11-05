# r.World TTW v2 — Asset Manifest

This document catalogs every image and video slot in the redesigned Test the Waters (TTW v2) page.
All missing assets are wired up with the reusable `.ph` (Placeholder) component. When a file is placed at its expected path, `js/ttw-v2.js` will automatically detect and render it without requiring any markup changes.

---

## Asset Slots

| # | Module | Slot Name | Expected Path | Aspect Ratio / Min Dims | Source / Reference Link | Status |
|---|---|---|---|---|---|---|
| 1 | 1. Hero | Background Reel Video | `public/assets/ttw/hero-reel.mp4` | 16:9 (1920×1080) | TBD (Crowd push-in reel) | Placeholder |
| 2 | 1. Hero | Background Reel Poster | `public/assets/ttw/hero-reel-poster.jpg` | 16:9 (1920×1080) | TBD (Poster frame) | Placeholder |
| 3 | 2. Brand Anthem | Brand Anthem Video | Embedded iframe (`TXxys99LGoM`) | 16:9 | https://www.youtube.com/watch?v=TXxys99LGoM | Wired / Active |
| 4 | 2. Brand Anthem | Video Poster Facade | `public/assets/2c11abe08b4d2d9f648efc1fb6a6dfac1671bdf4.jpg` | 16:9 (1280×720) | Existing codebase | Active |
| 5 | 3. Celebrities | Pedro Pascal | `public/assets/ttw/celebs/pedro-pascal.jpg` | 377×417 | Sourced from Figma (`e3394a59...`) | Active |
| 6 | 3. Celebrities | Meryl Streep + Martin Short | `public/assets/ttw/celebs/streep-short.jpg` | 377×417 | User provided asset / Figma | Active |
| 7 | 3. Celebrities | Leonardo DiCaprio | `public/assets/ttw/celebs/dicaprio.jpg` | 377×417 | User provided asset / Figma | Active |
| 8 | 3. Celebrities | Flea | `public/assets/ttw/celebs/flea.jpg` | 377×417 | User provided asset / Figma | Active |
| 9 | 3. Celebrities | Selena Gomez + Benny Blanco | `public/assets/ttw/celebs/gomez-blanco.jpg` | 377×417 | User provided asset / Figma | Active |
| 10 | 3. Celebrities | Jack Johnson | `public/assets/ttw/celebs/jack-johnson.jpg` | 377×417 | User provided asset / Figma | Active |
| 11 | 3. Celebrities | Rhea Seehorn | `public/assets/ttw/celebs/rhea-seehorn.jpg` | 377×417 | Sourced from Figma (`0caba051...`) | Active |
| 12 | 4. Partner Logos | 18 Partner Logos | `public/assets/*.png` | Various | Existing codebase | Active |
| 13 | 5. Reuse Loop | Pour | `public/assets/ttw/loop/pour.jpg` | 1:1 (600×600) | User provided asset (`media_1793859102068...`) | Active |
| 14 | 5. Reuse Loop | Return | `public/assets/ttw/loop/return.jpg` | 1:1 (600×600) | Jack Johnson at return bin | Active |
| 15 | 5. Reuse Loop | Clean | `public/assets/ttw/loop/clean.png` | 1:1 (600×600) | User provided asset (`media_1793859119853...`) | Active |
| 16 | 5. Reuse Loop | Reuse | `public/assets/ttw/loop/reuse.jpg` | 1:1 (600×600) | User provided asset (`media_1793859102117...`) | Active |
| 17 | 6. What's Inside | 5 OS Cards | `public/assets/*` | Existing 4:3 | Existing codebase | Active |
| 18 | 7. Social Proof | Sphere | `public/assets/ttw/venues/sphere.jpg` | 4:3 (800×600) | TBD | Placeholder |
| 19 | 7. Social Proof | Red Rocks Amphitheatre | `public/assets/ttw/venues/red-rocks.jpg` | 4:3 (800×600) | TBD | Placeholder |
| 20 | 7. Social Proof | Merriweather Post Pavilion | `public/assets/ttw/venues/merriweather.jpg` | 4:3 (800×600) | TBD | Placeholder |
| 21 | 7. Social Proof | SAP Center | `public/assets/ttw/venues/sap-center.jpg` | 4:3 (800×600) | TBD | Placeholder |
| 22 | 7. Social Proof | Crypto.com Arena | `public/assets/ttw/venues/crypto-com-arena.jpg` | 4:3 (800×600) | TBD | Placeholder |
| 23 | 7. Social Proof | CHS Field | `public/assets/ttw/venues/chs-field.jpg` | 4:3 (800×600) | TBD | Placeholder |
| 24 | 7. Social Proof | LA Memorial Coliseum | `public/assets/ttw/venues/la-coliseum.jpg` | 4:3 (800×600) | TBD | Placeholder |
| 25 | 7. Social Proof | TPC Twin Cities | `public/assets/ttw/venues/tpc-twin-cities.jpg` | 4:3 (800×600) | TBD | Placeholder |
| 26 | 7. Social Proof | Eric Shiflett Testimonial Avatar | `public/assets/santa-barbara-bowl.png` | 1:1 | Existing codebase | Active |
| 27 | 8. Where We Go Next | Healthcare | `public/assets/ttw/next/healthcare.jpg` | 4:5 (800×1000) | Stock TBD | Placeholder |
| 28 | 8. Where We Go Next | Corporate & College Campuses | `public/assets/ttw/next/campuses.jpg` | 4:5 (800×1000) | Stock TBD | Placeholder |
| 29 | 8. Where We Go Next | Travel & Hospitality | `public/assets/ttw/next/travel-hospitality.jpg` | 4:5 (800×1000) | Stock TBD | Placeholder |
| 30 | 8. Where We Go Next | Pink Arrow Brand Graphic | `public/assets/f525cc1ae2d374e515a07e53cd50020a3adcfe92.svg` | Vector | Existing codebase | Active |
| 31 | 9. State Legislation | US Map SVG + Wash Hub Icons | Inline SVG | Vector | Existing codebase | Active |
| 32 | 10. Why It Matters | 3 Existing Metric Icons | `public/assets/*.svg` | 1:1 | Existing codebase | Active |
| 33 | 10. Why It Matters | CO2 Avoidance Metric Icon | Inline SVG (temporary) | 1:1 | Brand asset TBD | Active (inline) |
| 34 | 11. Press | Yahoo Finance | `public/assets/ttw/press/yahoo-finance.png` | 5:2 (500×200) | Wireframe outlet | Placeholder |
| 35 | 11. Press | Packaging World | `public/assets/ttw/press/packaging-world.png` | 5:2 (500×200) | Wireframe outlet | Placeholder |
| 36 | 11. Press | Pollstar | `public/assets/ttw/press/pollstar.png` | 5:2 (500×200) | Wireframe outlet | Placeholder |
| 37 | 11. Press | Billboard | `public/assets/ttw/press/billboard.png` | 5:2 (500×200) | Wireframe outlet | Placeholder |
| 38 | 11. Press | The Washington Post | `public/assets/ttw/press/washington-post.png` | 5:2 (500×200) | Wireframe outlet | Placeholder |
| 39 | 11. Press | The Hollywood Reporter | `public/assets/ttw/press/hollywood-reporter.png` | 5:2 (500×200) | Wireframe outlet | Placeholder |
| 40 | 11. Press | Newsweek | `public/assets/ttw/press/newsweek.png` | 5:2 (500×200) | Wireframe outlet | Placeholder |
| 41 | 11. Press | Fast Company | `public/assets/ttw/press/fast-company.png` | 5:2 (500×200) | Wireframe outlet | Placeholder |
| 42 | 13. Next Steps | Concert Photo + Yellow Arrow | `public/assets/whats-next-concert.jpg` | Composite | Existing codebase | Active |
| 43 | 15. Footer | r.World Multi-part Logo SVG | `public/assets/4c5208ba0b027750...` | Vector | Existing codebase | Active |

