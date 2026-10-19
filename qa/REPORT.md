# Compliance Verification Report: TTW Page (Regulation CF)

**Spec Document**: `Crowdcheck Data Claims - TTW Changes.csv`  
**Execution Branch**: `compliance-edits`  
**Execution Date**: 2026-10-19  
**Dev Server**: `http://localhost:8080/`  
**Snapshot / Baseline URL**: `http://localhost:8080/snapshot/index.html`  
**Automated Verifier Suite**: `qa/verify.js` (Playwright v1.64.1 in Google Chrome)  
**Total CSV Records**: 50  
**Selected Ready Rows**: 26 (25 executed, 1 skipped-not-actionable)  
**Non-Ready Rows**: 24 (all verified untouched as negative controls)  
**Overall Verifier Summary**: Total Checks: 88 | Passed: 87 | Failed: 0 | Unverified: 1  

---

## 1. OPEN Items

The following items require client / stakeholder decisions, source reconciliation, or contain mandated placeholders preserved literally:

### A. Placeholders Preserved Literally (Logged as OPEN per Rule 2)
1. **`[month 2026]`** (Row 36):
   - **Location**: Regulatory card copy & Map legend label (`EPR Legislation Passed (7 states) as of [month 2026]`).
   - **Status**: Kept verbatim in DOM as instructed. Needs actual month filled in upon filing.
2. **`[DATE]`** (Row 16, 37, 46):
   - **Location**: Competitor volume comparison date, pending bills date, and Ecolab certification date.
   - **Status**: Open pending ops confirmation.
3. **`p. [__]`** (Row 30):
   - **Location**: OECD Global Plastics Outlook report page number for 9% recycling metric.
   - **Status**: Open pending Kate's substantiation review.

### B. Unresolved Comments & Decisions Flagged per Step 3 Instructions
1. **Row 4 (Global – unused sources)**:
   - Source links `Reuse Wins at Events (PDF)` and `WEF/Kearney` are retained in place and flagged as unresolved because the CSV does not map them to specific statements.
   - The long drafted regulatory section in row 4 is treated as REFERENCE ONLY (section was not restructured and H3 was not added).
   - Conflicts between row 4's reference copy and row-specific instructions (SB 54 target and penalties) were resolved in favor of row-specific instructions (Rows 38 and 40).
2. **Row 19 (Superlatives - 10 times)**:
   - "active in roughly 10 times more facilities than the next-largest provider" deleted from leader card.
   - The proposed replacement "r.World has washed roughly 3x more items than its primary competitor" was **NOT** inserted because the CSV notes that the cut-vs-replace decision is open/unconfirmed.
3. **Row 21 (Regulatory timing claim)**:
   - Revised to "r.World began building reuse infrastructure in 2017, years before the first state EPR laws passed." with Footnote 5 (OR SB 582 & ME LD 1541).
   - Flagged dangling "Addressed in line 50.0" reference from CSV.
4. **Rows 28 & 29 (Cities 150+ and States 35)**:
   - Footnotes 3 & 4 added to both metrics.
   - Numeric counts `150+ cities` and `Across 35 states` retained without change because ops counts remain unconfirmed (Mac to confirm 35 vs 35+ and cities count).
5. **Row 34 (Problem – 'bins are mostly for show')**:
   - Marked **SKIPPED-not-actionable** because the row supplies no replacement copy and no SSI report.
6. **Row 36 (EPR states)**:
   - Enacted states individually footnoted with official deep links (CA SB 54, CO HB 22-1355, OR SB 582, MN HF 3911, MD SB 901, WA E2SSB 5284, ME LD 1541).
   - `as of [month 2026]` retained literally as OPEN placeholder.
7. **Row 40 (Penalties)**:
   - Executed using the supplied `https://california.public.law/codes/public_resources_code_section_42081` link verbatim. Flagged reviewer note: "prefer official leginfo.legislature.ca.gov link".
8. **Row 41 (Pipeline – cities)**:
   - Sentence "Fifteen cities have asked us to come build." deleted from mid-page CTA copy as written. Flagged reviewer question: "why delete?".
9. **Row 43 (Pipeline – open loop)**:
   - Replaced claim with long-term capital/partner risk disclosure verbatim. Flagged reviewer note: "We need to get clear on open loop and if talking about CPG or restaurants, etc".

### C. UNVERIFIED Automated Checks
1. **`check-footnote-http-https://leginfo.legislature.ca`**:
   - **URL**: `https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202120220SB54`
   - **Result**: `UNVERIFIED` (HTTP 403 Forbidden).
   - **Cause**: The California State Legislature server uses Akamai Bot Manager, which rejects automated HTTP clients (curl/node https/Playwright direct fetch). Per prompt instructions, this is marked **UNVERIFIED, never PASS**. All other 10 external footnote URLs returned HTTP 200/301 OK.

---

## 2. Table of All 50 Rows

| Row # | Section | Disposition | Evidence (Check ID + Result) | Notes & Flags |
|---|---|---|---|---|
| 1 | Hero Copy  | **SKIPPED-not-ready** | N/A (Non-ready negative control verified untouched) | Status ''. Untouched per Hard Rule 3. |
| 2 | Open Loop/Closed Loop | **SKIPPED-not-ready** | N/A (Non-ready negative control verified untouched) | Status ''. Untouched per Hard Rule 3. |
| 3 | Global – footnotes | **VERIFIED** | check-row-3-sources-list: PASS<br>check-row-3-grouped-sources-absent: PASS | Numbered superscripts 1..15 implemented; #sources-list added; grouped sources removed. |
| 4 | Global – unused sources | **EXECUTED-WITH-FLAG** | check-row-4-unused-sources-retained: PASS | FLAG: Unused source links 'Reuse Wins at Events (PDF)' and 'WEF/Kearney' left in place pending Kate's resolution. Reference regulatory section not restructured; conflicts resolved in favor of row-specific instructions. |
| 5 | Global – images | **SKIPPED-not-ready** | neg-row-5-venue-photos: PASS | Status 'Needs decision'. Untouched per Hard Rule 3. Confirm each photo is an r.World venue/event and flag any stock images (Kate) |
| 6 | Legend – footer | **VERIFIED** | check-row-6-footer-legend: PASS<br>check-row-6-old-wording-absent: PASS | Exact 3-bullet Rule 206 legend and citation line placed in footer. |
| 7 | Legend – near each form | **VERIFIED** | check-row-7-forms-legend: PASS | Full Rule 206 legend placed conspicuously adjacent to both indication-of-interest forms. |
| 8 | Legend – top banner | **VERIFIED** | check-row-8-banner-anchor: PASS | 'Full disclosure below' made active anchor to #legal-legend with working smooth scroll. |
| 9 | CTA buttons | **VERIFIED** | check-row-9-cta-buttons: PASS | All CTA buttons updated to 'Join the Notification List'; banned words removed. |
| 10 | Form – disclaimer | **VERIFIED** | check-row-10-form-disclaimer: PASS | Mandated disclaimer added directly under submit buttons on both forms. |
| 11 | Form – investment bands | **VERIFIED** | check-row-11-investment-bands: PASS | Investment bands legend relabeled 'Optional, nonbinding: How much might you consider investing?'. |
| 12 | What happens now – Step 1 | **VERIFIED** | check-row-12-step1: PASS | Step 1 copy updated to 'You join the notification list with your name and email...'. |
| 13 | What happens now – Step 2 | **VERIFIED** | check-row-13-step2: PASS | Step 2 copy updated to Form C filing and StartEngine wording verbatim. |
| 14 | What happens now – Step 3 / email promise | **VERIFIED** | check-row-14-email-promise: PASS | Step 3 & success messages softened to 'We\'ll email you when the offering opens.'; priority removed. |
| 15 | Post-filing (future) | **SKIPPED-not-ready** | N/A (Non-ready negative control verified untouched) | Status 'Ready to act on when Form C is filed'. Untouched per Hard Rule 3. Schedule Rule 204 revision once Form C is filed (Kate) |
| 16 | Hero – superlative | **SKIPPED-not-ready** | neg-row-16-hero-superlative: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Capture competitor volume figures with URL + date accessed (screenshot), list peers compared (Kate/Annie) |
| 17 | Superlatives | **SKIPPED-not-ready** | neg-row-17-network-superlatives: PASS | Status 'Needs decision from Michael Martin and Mac Sellars'. Untouched per Hard Rule 3. Find public source(s) showing competitor program start dates to support 'first' (Kate) |
| 18 | Superlatives | **SKIPPED-not-ready** | neg-row-18-annually-superlative: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Confirm annual (not cumulative) competitor comparison exists; otherwise cut 'annually' (Annie) |
| 19 | Superlatives | **EXECUTED-WITH-FLAG** | check-row-19-10-times-cut: PASS | FLAG: 'active in roughly 10 times more facilities...' deleted; 3x replacement NOT inserted per instruction. |
| 20 | Operating system – Automation | **VERIFIED** | check-row-20-automation: PASS | Automation copy replaced with 14M capacity wording verbatim. |
| 21 | Regulatory timing claim | **EXECUTED-WITH-FLAG** | check-row-21-regulatory-timing: PASS | FLAG: Timing claim revised to 2017 infrastructure wording with Footnote 5. Flagged dangling 'line 50' reference. |
| 22 | Impact metrics – items | **SKIPPED-not-ready** | neg-row-22-items-metric: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Reconcile 30M vs. 29M units shown in r.Turn; confirm '30 million' or change to '29 million' (Annie to pull report) |
| 23 | Impact metrics – events | **SKIPPED-not-ready** | neg-row-23-events-metric: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Mac to provide spreadsheet showing event count method (pickup-based count) and confirm definition of 'event' |
| 24 | Impact metrics – waste diverted | **SKIPPED-not-ready** | neg-row-24-waste-metric: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Confirm 145 vs. 145,000 tons and reconcile with 30M items; decide whether to publish a methodology summary (PDF) to link in footnote (Mac) |
| 25 | Impact metrics – water | **SKIPPED-not-ready** | neg-row-25-water-metric: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Same as waste-diverted row: confirm figure and public methodology link (Mac) |
| 26 | Impact metrics – return rate | **VERIFIED** | check-row-26-return-rate-footnote: PASS | Return rate Footnote 1 added at first use and reused at later mention in Closed Loop. |
| 27 | Impact metrics – retention | **VERIFIED** | check-row-27-retention: PASS | Retention Footnote 2 added; '+' removed everywhere ('90% client retention' and bio). |
| 28 | Impact metrics – cities | **EXECUTED-WITH-FLAG** | check-row-28-cities-footnote: PASS | FLAG: Cities Footnote 3 added; '150+' retained as count is unconfirmed by ops. |
| 29 | Impact metrics – states | **EXECUTED-WITH-FLAG** | check-row-29-states-footnote: PASS | FLAG: States Footnote 4 added; 'Across 35 states' retained as 35 vs 35+ is unconfirmed by ops. |
| 30 | Problem – recycling rate | **SKIPPED-not-ready** | neg-row-30-recycling-rate: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Add exact OECD page/table number for the 9% figure (Kate) |
| 31 | Problem – recycling rate | **SKIPPED-not-ready** | neg-row-31-single-use-recycling: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Find source + methodology for 0–20% or approve EPA replacement (Kate) |
| 32 | Problem – volume | **SKIPPED-not-ready** | neg-row-32-volume: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Find source or approve cut (Kate) |
| 33 | Problem – disposal | **SKIPPED-not-ready** | neg-row-33-rapidly-filling: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Find source or approve cut (Kate) |
| 34 | Problem – 'bins are mostly for show' | **SKIPPED-not-actionable** | check-row-34-bins-unchanged: PASS | Row supplies no replacement copy and no SSI report. Skipped per Step 3 instruction. |
| 35 | Regulatory – intro | **SKIPPED-not-ready** | neg-row-35-regulatory-intro: PASS | Status 'Needs decision'. Untouched per Hard Rule 3. Approve revised wording (Kate) |
| 36 | Regulatory – EPR states (text + chart) | **EXECUTED-WITH-FLAG** | check-row-36-epr-states: PASS | FLAG: Individual state footnotes 6-12 added with official links; 'as of [month 2026]' retained as OPEN placeholder. |
| 37 | Regulatory – pending bills (text + chart) | **SKIPPED-not-ready** | neg-row-37-pending-bills: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Pull bill number and legislature link for each of the 12 states; confirm HI (needs-assessment bill) and WI (tracking only) belong on the list (Kate) |
| 38 | Regulatory – SB 54 target | **VERIFIED** | check-row-38-sb54-target: PASS | SB 54 target revised verbatim with 2023 levels and Footnote 13. |
| 39 | Regulatory – SB 54 reuse | **VERIFIED** | check-row-39-sb54-reuse: PASS | SB 54 reuse compliance disclaimer added verbatim; reuses Footnote 13. |
| 40 | Regulatory – penalties | **EXECUTED-WITH-FLAG** | check-row-40-penalties: PASS | FLAG: Penalties revised verbatim with Footnote 14 using california.public.law link. Flagged reviewer note 'prefer official leginfo link'. |
| 41 | Pipeline – cities | **EXECUTED-WITH-FLAG** | check-row-41-fifteen-cities: PASS | FLAG: 'Fifteen cities have asked us to come build.' deleted as written; flagged reviewer question 'why delete?'. |
| 42 | Pipeline – markets | **EXECUTED-WITH-FLAG** | check-row-42-markets: PASS | FLAG: 'markets we\'ve secured' softened to 'We believe r.World\'s technology and operating footprint would be hard to replicate' with Footnote 15. |
| 43 | Pipeline – open loop | **EXECUTED-WITH-FLAG** | check-row-43-open-loop: PASS | FLAG: Open loop claim replaced with capital/partners disclaimer; flagged reviewer note on open loop scope. |
| 44 | Closed vs. open loop – soften | **SKIPPED-not-ready** | neg-row-44-closed-loop-soften: PASS | Status 'Needs decision'. Untouched per Hard Rule 3. Approve softened wording (Kate) |
| 45 | Business model – terms | **SKIPPED-not-ready** | neg-row-45-loss-fees: PASS | Status 'Needs decision'. Untouched per Hard Rule 3. Resolve conflict: Kate's note says a contract can show universal applicability, but sheet says loss-fee waiver isn't universal – confirm with ops (Kate) |
| 46 | Operating system – Sanitization | **SKIPPED-not-ready** | neg-row-46-ecolab: PASS | Status 'Needs source'. Untouched per Hard Rule 3. Tim to provide certification docs: which hubs are certified, dates, and confirm r.World has permission to use the mark |
| 47 | Operating system – Technology | **SKIPPED-not-ready** | neg-row-47-rfid: PASS | Status 'Needs decision'. Untouched per Hard Rule 3. Confirm item-level tracking via QR applies to all items (Tim/Mac)
Address in line 50. |
| 48 | Why r.World? Why Now?  | **SKIPPED-malformed** | N/A (Header/misaligned row) | Malformed row with 'Ready' in wrong column. Skipped per Step 1 instruction. |
| 49 | Why r.World? Why Now?  | **SKIPPED-malformed** | neg-row-49-why-now-h3: PASS | Malformed row with 'Ready' in wrong column. Skipped per Step 1 instruction. |
| 50 | Two jobs for every dollar | **SKIPPED-malformed** | neg-row-50-two-jobs: PASS | Malformed row with 'Ready' in wrong column. Skipped per Step 1 instruction. |

---

## 3. Global Compliance Verifications

### A. Numbered Footnotes & Sources List
- **Order & Continuity**: Verified monotonic sequence 1..15 in rendered DOM order with no gaps, orphans, or duplicate IDs (`check-global-footnotes-sequence: PASS`).
- **Repeated Claims**:
  - `90% return rate` correctly uses Footnote 1 at first use (impact metric) and reuses Footnote 1 at the subsequent mention in Closed Loop Reuse.
  - `90% customer retention` correctly uses Footnote 2 at first use (impact metric) and reuses Footnote 2 at subsequent mentions (infrastructure copy and leadership bio).
  - `SB 54 compliance pathway` reuses Footnote 13 from SB 54 target.
- **Grouped Source Lines**: Completely removed from executed sections (Holland & Knight source credit line and "Source: r.World System Data" absent: `check-row-3-grouped-sources-absent: PASS`).
- **No Bare Homepages**: All footnote links tested; none point to a bare domain homepage (`check-footnote-not-bare-*: PASS`).
- **Network Validation**: 10 external links returned HTTP 200/301; 1 link (`leginfo.legislature.ca.gov`) marked `UNVERIFIED` due to Akamai 403 WAF blocking.

### B. Banned-Language Sweep
A case-insensitive word-boundary sweep across all rendered DOM text, image `alt` attributes, `aria-label` attributes, `title` attributes, and `<meta>` tags confirmed complete absence of banned promotional and priority-implying phrases:
- `reserve`: **PASS** (Zero occurrences outside mandated exempt sentence)
- `early access`: **PASS** (Zero occurrences)
- `spot`: **PASS** (Zero occurrences)
- `Notify me first`: **PASS** (Zero occurrences)
- `before r.World announces`: **PASS** (Zero occurrences)
- `nine years ahead`: **PASS** (Zero occurrences)
- `10 times`: **PASS** (Zero occurrences)
- **Mandated Disclaimer Exemption**: Verified present verbatim directly under submit buttons on both forms without triggering false positive.

### C. Rule 206 Legend Adjacent to Every Form & Footer
- **Footer**: Verified verbatim match of the 3-bullet legend with the `17 CFR § 227.206` citation line above it (`check-row-6-footer-legend: PASS`).
- **Near Each Form**: Exactly 2 indication-of-interest forms exist (`#hero-interest-form` and `#interest-form`), and both forms have adjacent, conspicuous Rule 206 legends containing the exact 3 bullets and citation (`check-row-7-forms-legend: PASS`).
- **Banner Anchor & Scroll**: Verified that "Full disclosure below." in the top announcement bar is a working hyperlink (`a[href="#legal-legend"]`) whose target exists in the DOM, and clicking it scrolls the browser window directly to the disclosure (`check-global-banner-scroll: PASS`).

### D. Viewports & Responsive Layouts
- **390px (Mobile)**: Verified `scrollWidth <= clientWidth` (390px vs 390px, zero horizontal overflow). Announcement bar, form legends, and footer disclosure computed as visible and not clipped (`check-viewport-390px: PASS`). Screenshot saved to `qa/screenshots/after-390px.png`.
- **1440px (Desktop)**: Verified `scrollWidth <= clientWidth` (1440px vs 1440px, zero horizontal overflow). All compliance elements visible and styled cleanly (`check-viewport-1440px: PASS`). Screenshot saved to `qa/screenshots/after-1440px.png`.

### E. Console Errors & Images
- **Console Errors**: 0 unhandled console errors during full page navigation (`check-console-errors: PASS`).
- **Broken Images**: All 41 rendered `<img>` elements loaded with `naturalWidth > 0` (`check-broken-images: PASS`).

### F. Diff Scope Mapping
Every modified hunk across `index.html`, `js/main.js`, `js/map-config.js`, and `css/styles.css` maps directly to a verified ledger row. No orphaned or extraneous hunks exist.
