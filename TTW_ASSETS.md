# r.World TTW v2 — Asset Manifest

This document catalogs every image and video slot in the redesigned Test the Waters (TTW v2) page.
All missing assets are wired up with the reusable `.ph` (Placeholder) component. When a file is placed at its expected path, `js/ttw-v2.js` will automatically detect and render it without requiring any markup changes.

---

## Asset Slots

| # | Module | Slot Name | Expected Path | Aspect Ratio / Min Dims | Source / Reference Link | Status |
|---|---|---|---|---|---|---|
| 1 | 1. Hero | Background Reel Video | `public/assets/ttw/hero-reel.mp4` | 16:9 (1920×1080) | User provided crowd reel (`14445520_1920_1080_30fps.mp4`) | Active |
| 2 | 1. Hero | Background Reel Poster | `public/assets/ttw/hero-reel-poster.jpg` | 16:9 (1920×1080) | Poster frame generated from reel | Active |
| 3 | 2. Brand Anthem | Brand Anthem Video | Embedded iframe (`yAKUKKdTXBw`) | 16:9 | https://www.youtube.com/watch?v=yAKUKKdTXBw | Wired / Active |
| 4 | 2. Brand Anthem | Video Poster Facade | `public/assets/ttw/brand-anthem-poster.jpg` | 16:9 (1280×720) | YouTube thumbnail of yAKUKKdTXBw | Active |
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
| 16b | 5. Reuse Loop | International Reuse Symbol Icon (IMG-05) | `public/assets/ttw/reuse-symbol.svg` | Vector (22×22) | PR3 Standards (pr3standards.org/the-reuse-symbol) | Active |
| 17 | 6. What's Inside | 4 Photography OS Cards | `public/assets/*` | Existing 563:640 | Existing codebase | Active |
| 17b | 6. What's Inside | Technology: r.Turn App Screenshot (T07) | `public/assets/ttw/rturn-app.jpg` | 636×1024 | User provided asset (media_1794150325995_883b7754) | Active |
| 18 | 7. Social Proof | Sphere | `public/assets/ttw/venues/sphere.jpg` | 4:3 (800×600) | Wikimedia Commons (CC BY 2.0 / Thomas Hawk) | Active |
| 19 | 7. Social Proof | Red Rocks Amphitheatre | `public/assets/ttw/venues/red-rocks.jpg` | 4:3 (800×600) | Wikimedia Commons (CC BY-SA 4.0 / Carol M. Highsmith Archive) | Active |
| 20 | 7. Social Proof | Merriweather Post Pavilion | `public/assets/ttw/venues/merriweather.jpg` | 4:3 (800×600) | Wikimedia Commons (CC BY-SA 4.0 / Famartin) | Active |
| 21 | 7. Social Proof | SAP Center | `public/assets/ttw/venues/sap-center.jpg` | 4:3 (800×600) | Wikimedia Commons (CC BY 2.0 / Sharks Arena) | Active |
| 22 | 7. Social Proof | Crypto.com Arena | `public/assets/ttw/venues/crypto-com-arena.jpg` | 4:3 (800×600) | Wikimedia Commons (CC BY-SA 4.0 / Daniel D'Amore) | Active |
| 23 | 7. Social Proof | CHS Field | `public/assets/ttw/venues/chs-field.jpg` | 4:3 (800×600) | Wikimedia Commons (CC BY 2.0 / Baseball Stadium) | Active |
| 24 | 7. Social Proof | LA Memorial Coliseum | `public/assets/ttw/venues/la-coliseum.jpg` | 4:3 (800×600) | Wikimedia Commons (CC BY-SA 3.0 / Coliseum Peristyle) | Active |
| 25 | 7. Social Proof | TPC Twin Cities | `public/assets/ttw/venues/tpc-twin-cities.jpg` | 4:3 (800×600) | Wikimedia Commons (CC BY-SA 2.0 / TPC Championship Green) | Active |
| 26 | 7. Social Proof | Eric Shiflett Testimonial Avatar | `public/assets/santa-barbara-bowl.png` | 1:1 | Existing codebase | Active |
| 27 | 8. Where We Go Next | Healthcare | `public/assets/ttw/next/healthcare.jpg` | 4:5 (1200×800 resampled) | Pexels (photo 11782003) | Active |
| 28 | 8. Where We Go Next | Corporate & College Campuses | `public/assets/ttw/next/campuses.jpg` | 4:5 (1200×800 resampled) | Pexels (photo 31039051) | Active |
| 29 | 8. Where We Go Next | Travel & Hospitality | `public/assets/ttw/next/travel-hospitality.jpg` | 4:5 (1335×1780) | Unsplash (photo 1606046604972) | Active |
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

