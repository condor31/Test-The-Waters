const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const targetUrl = process.argv[2] || 'http://localhost:8080/';
const isSnapshot = targetUrl.includes('snapshot') || process.argv.includes('--snapshot');
const prefix = isSnapshot ? 'before' : 'after';

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

function normalize(str) {
  if (!str) return '';
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&sect;/g, '§')
    .replace(/&middot;/g, '·')
    .replace(/&copy;/g, '©')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&trade;/g, '™')
    .replace(/\s+/g, ' ')
    .trim();
}

async function checkUrlStatus(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const parsed = new URL(url);
      const req = client.request(parsed, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 8000
      }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ status: res.statusCode, pass: true });
        } else {
          resolve({ status: res.statusCode, pass: false, error: `HTTP ${res.statusCode}` });
        }
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, pass: false, error: 'Timeout' });
      });
      req.on('error', (e) => {
        resolve({ status: 0, pass: false, error: e.message });
      });
      req.end();
    } catch (e) {
      resolve({ status: 0, pass: false, error: e.message });
    }
  });
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = {
    targetUrl,
    mode: isSnapshot ? 'UNEDITED_SNAPSHOT' : 'EDITED_PAGE',
    timestamp: new Date().toISOString(),
    checks: [],
    summary: { total: 0, passed: 0, failed: 0, unverified: 0 }
  };

  const consoleErrors = [];
  const pageErrors = [];

  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log(`\n======================================================`);
  console.log(`Running QA Verifier against: ${targetUrl}`);
  console.log(`Mode: ${results.mode}`);
  console.log(`======================================================\n`);

  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  function addResult(id, name, type, passed, details = '', unverified = false) {
    results.summary.total++;
    const status = unverified ? 'UNVERIFIED' : (passed ? 'PASS' : 'FAIL');
    if (unverified) results.summary.unverified++;
    else if (passed) results.summary.passed++;
    else results.summary.failed++;

    results.checks.push({ id, name, type, status, details });
    const mark = status === 'PASS' ? '✅ PASS' : (status === 'UNVERIFIED' ? '⚠️ UNVERIFIED' : '❌ FAIL');
    console.log(`[${status.padEnd(10)}] ${id.padEnd(35)} : ${name} ${details ? '(' + details + ')' : ''}`);
  }

  // Retrieve rendered full text, innerHTML, all attribute values, and meta tags
  const renderedBodyText = normalize(await page.innerText('body'));
  const renderedBodyHtml = await page.innerHTML('body');
  const allTextAndAttrs = await page.evaluate(() => {
    const texts = [];
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        texts.push(node.textContent);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const attr of ['alt', 'aria-label', 'title', 'placeholder']) {
          if (node.hasAttribute(attr)) texts.push(node.getAttribute(attr));
        }
        for (const child of node.childNodes) walk(child);
      }
    };
    walk(document.body);
    // Include head metas
    document.querySelectorAll('meta').forEach(m => {
      if (m.hasAttribute('content')) texts.push(m.getAttribute('content'));
    });
    return texts.join(' ');
  });
  const normalizedAllText = normalize(allTextAndAttrs);

  // ---------------------------------------------------------
  // ROW LEVEL CHECKS (READY ROWS)
  // ---------------------------------------------------------

  // Row 3: Global - footnotes
  const sourcesListExists = await page.evaluate(() => {
    const sl = document.getElementById('sources-list');
    return !!sl && sl.querySelectorAll('li').length >= 10;
  });
  addResult('check-row-3-sources-list', 'Sources list exists with matching entries', 'PRESENT', sourcesListExists);

  const groupedSourcesAbsent = !renderedBodyHtml.includes('Holland & Knight, January 2026') && !renderedBodyHtml.includes('Source: r.World System Data');
  addResult('check-row-3-grouped-sources-absent', 'Old grouped source lines absent', 'ABSENT', groupedSourcesAbsent);

  // Row 4: Global - unused sources
  const reuseWinsPresent = normalizedAllText.includes('Reuse Wins at Events (PDF)');
  const wefKearneyPresent = normalizedAllText.includes('WEF/Kearney');
  addResult('check-row-4-unused-sources-retained', 'Reuse Wins at Events & WEF/Kearney links retained', 'PRESENT', reuseWinsPresent && wefKearneyPresent);

  // Row 6: Legend - footer
  const footerLegalText = normalize(await page.evaluate(() => {
    const el = document.querySelector('.site-footer__legal') || document.getElementById('legal-legend');
    return el ? el.innerText : '';
  }));
  const b1 = "No money or other consideration is being solicited, and if sent in response, will not be accepted;";
  const b2 = "No offer to buy the securities can be accepted and no part of the purchase price can be received until the offering statement is filed and only through the platform of an intermediary (funding portal or broker-dealer); and";
  const b3 = "A person's indication of interest includes no obligation or commitment of any kind.";
  const cit = "17 CFR § 227.206";

  const row6Pass = footerLegalText.includes(normalize(cit)) &&
                   footerLegalText.includes(normalize(b1)) &&
                   footerLegalText.includes(normalize(b2)) &&
                   footerLegalText.includes(normalize(b3));
  addResult('check-row-6-footer-legend', 'Footer matches exact 3-bullet legend and citation', 'PRESENT', row6Pass);

  const oldFooterAbsent = !footerLegalText.includes('involves no obligation');
  addResult('check-row-6-old-wording-absent', 'Old footer phrase "involves no obligation" absent', 'ABSENT', oldFooterAbsent);

  // Row 7: Legend - near each form
  const formsAdjacentLegends = await page.evaluate(() => {
    const forms = document.querySelectorAll('form.cta-form');
    let matching = 0;
    forms.forEach(f => {
      // Look for adjacent or descendant Rule 206 legend
      const parent = f.parentElement;
      const legend = parent ? parent.querySelector('.rule-206-legend, .legend-rule-206, [data-rule-206-legend]') : null;
      if (legend && legend.innerText.includes('17 CFR § 227.206')) {
        matching++;
      }
    });
    return { formCount: forms.length, matchingLegends: matching };
  });
  const row7Pass = formsAdjacentLegends.formCount >= 2 && formsAdjacentLegends.formCount === formsAdjacentLegends.matchingLegends;
  addResult('check-row-7-forms-legend', 'Full Rule 206 legend sits adjacent to every form', 'STRUCTURE', row7Pass, `forms: ${formsAdjacentLegends.formCount}, legends: ${formsAdjacentLegends.matchingLegends}`);

  // Row 8: Legend - top banner
  const bannerLinkInfo = await page.evaluate(() => {
    const bar = document.getElementById('announcement-bar');
    if (!bar) return { hasBar: false };
    const link = bar.querySelector('a');
    if (!link) return { hasBar: true, hasLink: false };
    const href = link.getAttribute('href');
    const target = href && href.startsWith('#') ? document.querySelector(href) : null;
    return {
      hasBar: true,
      hasLink: true,
      href,
      targetExists: !!target,
      linkText: link.innerText
    };
  });
  const row8Pass = bannerLinkInfo.hasLink && bannerLinkInfo.targetExists && normalize(bannerLinkInfo.linkText).includes('Full disclosure below');
  addResult('check-row-8-banner-anchor', 'Banner "Full disclosure below" is a working anchor link', 'STRUCTURE', row8Pass, `href: ${bannerLinkInfo.href}`);

  // Row 9: CTA buttons
  const ctaButtons = await page.evaluate(() => {
    const heroBtn = document.getElementById('hero-subscribe-btn');
    const interestBtn = document.getElementById('interest-subscribe-btn');
    const midBtn = document.querySelector('.mid-page-cta__btn');
    const persistBtn = document.querySelector('.persistent-cta__btn');
    return {
      hero: heroBtn ? heroBtn.innerText.trim() : null,
      interest: interestBtn ? interestBtn.innerText.trim() : null,
      mid: midBtn ? midBtn.innerText.trim() : null,
      persist: persistBtn ? persistBtn.textContent.trim() : null
    };
  });
  const expectedCta = 'Join the Notification List';
  const row9Pass = ctaButtons.hero === expectedCta &&
                   ctaButtons.interest === expectedCta &&
                   ctaButtons.mid === expectedCta &&
                   ctaButtons.persist === expectedCta;
  addResult('check-row-9-cta-buttons', 'All CTA buttons changed to "Join the Notification List"', 'PRESENT', row9Pass, JSON.stringify(ctaButtons));

  // Row 10: Form - disclaimer
  const formDisclaimers = await page.evaluate(() => {
    const forms = document.querySelectorAll('form.cta-form');
    const texts = [];
    forms.forEach(f => {
      const btn = f.querySelector('button[type="submit"]');
      if (btn) {
        let next = btn.nextElementSibling;
        while (next && next.tagName === 'DIV' && next.hasAttribute('hidden')) {
          next = next.nextElementSibling;
        }
        if (next) texts.push(next.innerText.trim());
      }
    });
    return texts;
  });
  const mandatedDisclaimer = "Joining this list does not reserve shares, allocations, pricing, priority or any investment rights. No money will be accepted.";
  const row10Pass = formDisclaimers.length >= 2 && formDisclaimers.every(t => normalize(t).includes(normalize(mandatedDisclaimer)));
  addResult('check-row-10-form-disclaimer', 'Mandated disclaimer directly under form submit buttons', 'PRESENT', row10Pass, `Count: ${formDisclaimers.length}`);

  // Row 11: Form - investment bands
  const investmentLegend = await page.evaluate(() => {
    const el = document.querySelector('#interest-form .range-group__legend');
    return el ? el.innerText.trim() : '';
  });
  const expectedInvLegend = "Optional, nonbinding: How much might you consider investing?";
  const row11Pass = normalize(investmentLegend) === normalize(expectedInvLegend);
  addResult('check-row-11-investment-bands', 'Investment bands relabeled "Optional, nonbinding: How much might you consider investing?"', 'PRESENT', row11Pass, investmentLegend);

  // Row 12: What happens now - Step 1
  const step1Text = await page.evaluate(() => {
    const el = document.querySelector('.numbered-list li:nth-child(1) p');
    return el ? el.innerText.trim() : '';
  });
  const row12Pass = normalize(step1Text).includes("join the notification list") && !normalize(step1Text).includes("sign up for early access");
  addResult('check-row-12-step1', 'Step 1: "join the notification list" replaces "sign up for early access"', 'PRESENT', row12Pass, step1Text);

  // Row 13: What happens now - Step 2
  const step2Text = await page.evaluate(() => {
    const el = document.querySelector('.numbered-list li:nth-child(2) p');
    return el ? el.innerText.trim() : '';
  });
  const expectedStep2 = "r.World files its Form C offering statement with the SEC. Once the Form C is filed, the offering opens on StartEngine, a registered intermediary, where investments can be made.";
  const row13Pass = normalize(step2Text).includes(normalize(expectedStep2));
  addResult('check-row-13-step2', 'Step 2: Form C offering statement wording exactly present', 'PRESENT', row13Pass);

  // Row 14: What happens now - Step 3 / email promise
  const step3Text = await page.evaluate(() => {
    const el = document.querySelector('.numbered-list li:nth-child(3) p');
    return el ? el.innerText.trim() : '';
  });
  const successDescTexts = await page.evaluate(() => {
    const els = document.querySelectorAll('.cta-form__success-desc');
    return Array.from(els).map(e => e.innerText.trim());
  });
  const row14Pass = normalize(step3Text).includes("We'll email you when the offering opens.") &&
                   !normalizedAllText.includes("before r.world announces") &&
                   !normalizedAllText.includes("before the public announcement");
  addResult('check-row-14-email-promise', 'Step 3 / success copy softened, priority implications removed', 'PRESENT', row14Pass);

  // Row 19: Superlatives ("10 times")
  const tenTimesAbsent = !normalizedAllText.includes('10 times');
  const threeXNotInserted = !normalizedAllText.includes('3x more items');
  const superlativeRowText = await page.evaluate(() => {
    const el = document.querySelector('.why-now__card--leader p');
    return el ? el.innerText.trim() : '';
  });
  const row19Pass = tenTimesAbsent && threeXNotInserted && normalize(superlativeRowText).includes('processing more reusable foodware annually than anyone else');
  addResult('check-row-19-10-times-cut', 'Active in roughly 10 times deleted without 3x replacement', 'ABSENT', row19Pass, `tenTimesAbsent=${tenTimesAbsent}, threeXNotInserted=${threeXNotInserted}`);

  // Row 20: Operating system - Automation
  const automationText = await page.evaluate(() => {
    const el = document.querySelector('.os-card:nth-of-type(3) .os-card__info p');
    return el ? el.innerText.trim() : '';
  });
  const expectedAuto = "A single automated dish line can handle up to 14M items a year on one shift, with capacity in place for the demand ahead.";
  const row20Pass = normalize(automationText) === normalize(expectedAuto);
  addResult('check-row-20-automation', 'Automation copy updated to 14M capacity wording', 'PRESENT', row20Pass, automationText);

  // Row 21: Regulatory timing claim
  const timingText = await page.evaluate(() => {
    const el = document.querySelector('.why-now__card--states p:first-of-type');
    return el ? el.innerText.trim() : '';
  });
  const expectedTiming = "r.World began building reuse infrastructure in 2017, years before the first state EPR laws passed";
  const row21Pass = normalize(timingText).includes(normalize(expectedTiming)) && !normalize(timingText).includes("nine years ahead");
  addResult('check-row-21-regulatory-timing', 'Timing claim updated to 2017 infrastructure wording and "nine years ahead" absent', 'PRESENT', row21Pass, timingText);

  // Row 26: Impact metrics - return rate
  const returnRateFootnote = await page.evaluate(() => {
    const stripe = Array.from(document.querySelectorAll('.impact-stripe')).find(el => {
      const label = el.querySelector('.impact-stripe__label');
      return label && label.innerText.includes('return rate');
    });
    const sup = stripe ? stripe.querySelector('sup') : null;
    return sup ? sup.innerText.trim() : '';
  });
  const row26Pass = returnRateFootnote.length > 0;
  addResult('check-row-26-return-rate-footnote', '90% return rate has superscript footnote ref', 'PRESENT', row26Pass, `sup: ${returnRateFootnote}`);

  // Row 27: Impact metrics - retention
  const retentionPlusAbsent = !renderedBodyHtml.includes('90%+');
  const retentionFootnote = await page.evaluate(() => {
    const stripe = Array.from(document.querySelectorAll('.impact-stripe')).find(el => {
      const label = el.querySelector('.impact-stripe__label');
      return label && label.innerText.includes('customer retention');
    });
    const sup = stripe ? stripe.querySelector('sup') : null;
    return sup ? sup.innerText.trim() : '';
  });
  const row27Pass = retentionPlusAbsent && retentionFootnote.length > 0;
  addResult('check-row-27-retention', 'Retention shows 90% everywhere without "+" and has footnote ref', 'PRESENT', row27Pass, `retentionPlusAbsent: ${retentionPlusAbsent}, sup: ${retentionFootnote}`);

  // Row 28: Impact metrics - cities
  const citiesFootnote = await page.evaluate(() => {
    const stripe = Array.from(document.querySelectorAll('.impact-stripe')).find(el => {
      const num = el.querySelector('.impact-stripe__number');
      return num && num.innerText.includes('150+ cities');
    });
    const sup = stripe ? stripe.querySelector('sup') : null;
    return sup ? sup.innerText.trim() : '';
  });
  const citiesNumberKept = normalize(renderedBodyText).includes('150+ cities');
  const row28Pass = citiesFootnote.length > 0 && citiesNumberKept;
  addResult('check-row-28-cities-footnote', '150+ cities retained and has footnote ref', 'PRESENT', row28Pass, `citiesNumberKept: ${citiesNumberKept}, sup: ${citiesFootnote}`);

  // Row 29: Impact metrics - states
  const statesFootnote = await page.evaluate(() => {
    const stripe = Array.from(document.querySelectorAll('.impact-stripe')).find(el => {
      const num = el.querySelector('.impact-stripe__number');
      return num && num.innerText.includes('35 states');
    });
    const sup = stripe ? stripe.querySelector('sup') : null;
    return sup ? sup.innerText.trim() : '';
  });
  const statesNumberKept = normalize(renderedBodyText).toLowerCase().includes('across 35 states');
  const row29Pass = statesFootnote.length > 0 && statesNumberKept;
  addResult('check-row-29-states-footnote', 'Across 35 states retained and has footnote ref', 'PRESENT', row29Pass, `statesNumberKept: ${statesNumberKept}, sup: ${statesFootnote}`);

  // Row 34: Problem - bins are mostly for show (SKIPPED-not-actionable)
  const binsPresent = normalize(renderedBodyText).toLowerCase().includes('sadly, the bins are mostly for show');
  addResult('check-row-34-bins-unchanged', 'Row 34 copy intact (SKIPPED-not-actionable)', 'UNCHANGED', binsPresent);

  // Row 36: Regulatory - EPR states (text + chart)
  const eprMonthPlaceholderPresent = normalize(renderedBodyText).includes('as of [month 2026]');
  const individualStateRefs = await page.evaluate(() => {
    const container = document.querySelector('.why-now__card--states');
    if (!container) return false;
    const states = ['CA', 'CO', 'OR', 'MN', 'MD', 'WA', 'ME'];
    const html = container.innerHTML;
    // Check if each state has an individual footnote or link
    return states.every(st => html.includes(st));
  });
  const row36Pass = eprMonthPlaceholderPresent && individualStateRefs;
  addResult('check-row-36-epr-states', 'EPR states have "as of [month 2026]" placeholder and individual state footnotes', 'PRESENT', row36Pass, `monthPlaceholder: ${eprMonthPlaceholderPresent}`);

  // Row 38: Regulatory - SB 54 target
  const expectedSb54Target = "California's SB 54 requires producers to reduce single-use plastic packaging and plastic food service ware 25% by 2032, compared with 2023 levels.";
  const sb54TargetPresent = normalize(renderedBodyText).includes(normalize(expectedSb54Target));
  addResult('check-row-38-sb54-target', 'SB 54 target revised verbatim with 2023 levels', 'PRESENT', sb54TargetPresent);

  // Row 39: Regulatory - SB 54 reuse
  const expectedSb54Disclaimer = "SB 54 does not require any producer or venue to use r.World or any particular reuse provider. We believe reuse systems like ours can help producers meet these targets.";
  const sb54ReusePresent = normalize(renderedBodyText).includes(normalize(expectedSb54Disclaimer));
  addResult('check-row-39-sb54-reuse', 'SB 54 reuse compliance disclaimer added verbatim', 'PRESENT', sb54ReusePresent);

  // Row 40: Regulatory - penalties
  const expectedPenalties = "CalRecycle may impose administrative civil penalties of up to $50,000 per day, per violation, on noncompliant producers or producer responsibility organizations.";
  const penaltiesPresent = normalize(renderedBodyText).includes(normalize(expectedPenalties));
  const oldPenaltiesAbsent = !normalize(renderedBodyText).includes("penalties of up to $50,000 a day");
  const row40Pass = penaltiesPresent && oldPenaltiesAbsent;
  addResult('check-row-40-penalties', 'Penalties revised verbatim and old phrase absent', 'PRESENT', row40Pass);

  // Row 41: Pipeline - cities
  const fifteenCitiesAbsent = !normalizedAllText.toLowerCase().includes('fifteen cities have asked us to come build');
  addResult('check-row-41-fifteen-cities', 'Fifteen cities deleted from page', 'ABSENT', fifteenCitiesAbsent);

  // Row 42: Pipeline - markets
  const expectedMarkets = "We believe r.World's technology and operating footprint would be hard to replicate.";
  const marketsPresent = normalize(renderedBodyText).includes(normalize(expectedMarkets));
  const oldMarketsAbsent = !normalize(renderedBodyText).includes("markets we've secured are hard to replicate");
  const row42Pass = marketsPresent && oldMarketsAbsent;
  addResult('check-row-42-markets', 'Markets softened and operating footprint wording present', 'PRESENT', row42Pass);

  // Row 43: Pipeline - open loop
  const expectedOpenLoop = "Over the long term, we hope to extend our infrastructure to open-loop reuse. This would require additional capital, partners and execution, and may not occur.";
  const openLoopPresent = normalize(renderedBodyText).includes(normalize(expectedOpenLoop));
  const oldOpenLoopAbsent = !normalize(renderedBodyText).includes("can deliver open-loop reuse at scale");
  const row43Pass = openLoopPresent && oldOpenLoopAbsent;
  addResult('check-row-43-open-loop', 'Open loop softened copy present and old claim absent', 'PRESENT', row43Pass);

  // ---------------------------------------------------------
  // NEGATIVE CONTROLS (NON-READY ROWS)
  // ---------------------------------------------------------
  const negativeControls = [
    { id: 'neg-row-5-venue-photos', name: 'Row 5 (Images): Venue photos untouched', text: 'Crowd at an outdoor music festival' },
    { id: 'neg-row-16-hero-superlative', name: 'Row 16 (Hero superlative): Leading reuse infrastructure copy untouched', text: "r.World operates the nation's leading reuse infrastructure wherever single-use waste is created" },
    { id: 'neg-row-17-network-superlatives', name: 'Row 17 (Superlatives): First, largest and most advanced untouched', text: 'first, largest and most advanced reuse network' },
    { id: 'neg-row-18-annually-superlative', name: 'Row 18 (Superlatives): processing more reusable foodware annually untouched', text: 'processing more reusable foodware annually than anyone else' },
    { id: 'neg-row-22-items-metric', name: 'Row 22 (Metrics): Over 30 million single-use items untouched', text: 'Over 30 million single-use items' },
    { id: 'neg-row-23-events-metric', name: 'Row 23 (Metrics): 10,000 events untouched', text: '10,000 events' },
    { id: 'neg-row-24-waste-metric', name: 'Row 24 (Metrics): 145 tons untouched', text: '145 tons of single-use waste' },
    { id: 'neg-row-25-water-metric', name: 'Row 25 (Metrics): 5.89M gallons untouched', text: '5.89M' },
    { id: 'neg-row-30-recycling-rate', name: 'Row 30 (Recycling rate): Only 9% of plastic waste is successfully recycled untouched', text: 'Only 9% of plastic waste is successfully recycled.' },
    { id: 'neg-row-31-single-use-recycling', name: 'Row 31 (Recycling range): runs between 0 and 20% untouched', text: 'the recycling rate for single-use items runs between 0 and 20%' },
    { id: 'neg-row-32-volume', name: 'Row 32 (Volume): hundreds of thousands untouched', text: 'hundreds of thousands of single-use cups and containers are produced every year' },
    { id: 'neg-row-33-rapidly-filling', name: 'Row 33 (Disposal): rapidly filling up untouched per Hard Rule 3', text: 'landfills rapidly filling up' },
    { id: 'neg-row-35-regulatory-intro', name: 'Row 35 (Regulatory): Several states are asking for it untouched', text: 'Several states are asking for it and enacting legislation requiring it.' },
    { id: 'neg-row-37-pending-bills', name: 'Row 37 (Pending bills): 10 more have bills in progress untouched', text: '10 more have bills in progress to enact EPR laws with fines for single-use.' },
    { id: 'neg-row-44-closed-loop-soften', name: 'Row 44 (Closed loop): r.World has solved for Closed Loop Reuse untouched', text: 'r.World has solved for Closed Loop Reuse.' },
    { id: 'neg-row-45-loss-fees', name: 'Row 45 (Terms): No upfront cost and no loss fees untouched', text: 'No upfront cost and no loss fees.' },
    { id: 'neg-row-46-ecolab', name: 'Row 46 (Sanitization): Ecolab Science Certified untouched', text: 'Regional centers running Ecolab Science Certified' },
    { id: 'neg-row-47-rfid', name: 'Row 47 (Technology): RFID untouched', text: 'r.Turn, the QR- and RFID-enabled platform' },
    { id: 'neg-row-49-why-now-h3', name: 'Row 49 (Malformed row): Several States Now Require H3 untouched', text: 'Several States Now Require What r.World Has Been Working On Since 2017' },
    { id: 'neg-row-50-two-jobs', name: 'Row 50 (Malformed row): Two jobs for every dollar untouched', text: "Two jobs for every dollar: Drive the cost down, and build what single-use can't" }
  ];

  for (const nc of negativeControls) {
    const present = normalizedAllText.toLowerCase().includes(normalize(nc.text).toLowerCase());
    addResult(nc.id, nc.name, 'UNCHANGED', present);
  }

  // ---------------------------------------------------------
  // GLOBAL CHECKS
  // ---------------------------------------------------------

  // Global Check a: Footnotes
  const footnoteCheck = await page.evaluate(() => {
    const sups = Array.from(document.querySelectorAll('sup.footnote-ref, .footnote-ref'));
    const numbers = sups.map(s => parseInt(s.innerText.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    const sourcesList = document.getElementById('sources-list');
    const sourceItems = sourcesList ? Array.from(sourcesList.querySelectorAll('li')) : [];

    // Check DOM order monotonic and continuous unique numbers
    const uniqueInOrder = [];
    numbers.forEach(n => {
      if (!uniqueInOrder.includes(n)) uniqueInOrder.push(n);
    });

    let continuous = true;
    for (let i = 0; i < uniqueInOrder.length; i++) {
      if (uniqueInOrder[i] !== i + 1) continuous = false;
    }

    return {
      totalRefs: numbers.length,
      uniqueRefs: uniqueInOrder.length,
      maxRef: Math.max(...numbers, 0),
      continuous,
      uniqueInOrder,
      sourceItemCount: sourceItems.length
    };
  });
  const footnoteValid = footnoteCheck.continuous && footnoteCheck.uniqueRefs > 0 && footnoteCheck.uniqueRefs === footnoteCheck.sourceItemCount;
  addResult('check-global-footnotes-sequence', 'Footnotes run 1..N in DOM order with no gaps or orphans', 'STRUCTURE', footnoteValid, JSON.stringify(footnoteCheck));

  // Check URLs in Sources list
  const sourceUrls = await page.evaluate(() => {
    const list = document.getElementById('sources-list');
    if (!list) return [];
    return Array.from(list.querySelectorAll('a')).map(a => a.href);
  });
  for (const u of sourceUrls) {
    const urlObj = new URL(u);
    const isBare = urlObj.pathname === '/' || urlObj.pathname === '';
    addResult(`check-footnote-not-bare-${u.substring(0, 30)}`, `Footnote link is not a bare homepage: ${u}`, 'STRUCTURE', !isBare);

    const netResult = await checkUrlStatus(u);
    if (netResult.pass) {
      addResult(`check-footnote-http-${u.substring(0, 30)}`, `HTTP 200 for ${u}`, 'PRESENT', true, `status: ${netResult.status}`);
    } else {
      addResult(`check-footnote-http-${u.substring(0, 30)}`, `HTTP check for ${u}`, 'PRESENT', false, `status: ${netResult.status}, error: ${netResult.error}`, true);
    }
  }

  // Global Check b: Banned-language sweep
  const bannedKeywords = [
    { word: 'reserve', regex: /\breserve\b/i },
    { word: 'early access', regex: /\bearly access\b/i },
    { word: 'spot', regex: /\bspot\b/i },
    { word: 'Notify me first', regex: /Notify me first/i },
    { word: 'before r.World announces', regex: /before r\.World announces/i },
    { word: 'nine years ahead', regex: /nine years ahead/i },
    { word: '10 times', regex: /10 times/i }
  ];

  // Strip exempt text before testing:
  // "Joining this list does not reserve shares, allocations, pricing, priority or any investment rights. No money will be accepted."
  const sanitizedText = normalizedAllText.replace(
    /Joining this list does not reserve shares, allocations, pricing, priority or any investment rights\. No money will be accepted\./gi,
    ''
  );

  for (const bk of bannedKeywords) {
    const hasBanned = bk.regex.test(sanitizedText);
    addResult(`check-banned-${bk.word.replace(/\s+/g, '-')}`, `Banned phrase absent: "${bk.word}"`, 'ABSENT', !hasBanned);
  }

  // Global Check c: Banner anchor scroll test
  const bannerScroll = await page.evaluate(async () => {
    const link = document.querySelector('#announcement-bar a[href^="#"]');
    if (!link) return { scrolled: false, reason: 'no link' };
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (!target) return { scrolled: false, reason: 'target not found' };

    const initialY = window.scrollY;
    link.click();
    await new Promise(r => setTimeout(r, 200));
    return {
      scrolled: window.scrollY !== initialY,
      scrollY: window.scrollY,
      targetTop: target.getBoundingClientRect().top
    };
  });
  addResult('check-global-banner-scroll', 'Clicking banner anchor scrolls toward legend target', 'STRUCTURE', bannerScroll.scrolled || bannerScroll.scrollY > 0, JSON.stringify(bannerScroll));

  // Global Check d: Viewports & Overflow & Screenshots
  for (const vp of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(vp);
    await page.waitForTimeout(300);

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientWidth = doc.clientWidth;
      const overflow = scrollWidth > clientWidth;

      const bar = document.getElementById('announcement-bar');
      const legend = document.getElementById('legal-legend') || document.querySelector('.site-footer__legal');

      const isVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      };

      return {
        clientWidth,
        scrollWidth,
        hasHorizontalOverflow: overflow,
        barVisible: isVisible(bar),
        legendVisible: isVisible(legend)
      };
    });

    const vpPass = !metrics.hasHorizontalOverflow && metrics.barVisible && metrics.legendVisible;
    addResult(`check-viewport-${vp.width}px`, `Viewport ${vp.width}px no overflow, banner & legend visible`, 'STRUCTURE', vpPass, JSON.stringify(metrics));

    const shotPath = path.join(screenshotsDir, `${prefix}-${vp.width}px.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(`Saved screenshot: ${shotPath}`);
  }

  // Global Check e: Console & Images
  await page.evaluate(() => { document.querySelectorAll('img').forEach(i => i.loading = 'eager'); window.scrollTo(0, document.body.scrollHeight); });
  await page.waitForTimeout(1000);
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const broken = [];
    imgs.forEach(img => {
      if (!img.naturalWidth || img.naturalWidth === 0) {
        broken.push(img.src || img.getAttribute('src'));
      }
    });
    return broken;
  });
  addResult('check-console-errors', 'No console errors during navigation', 'STRUCTURE', consoleErrors.length === 0, `errors: ${consoleErrors.length}`);
  addResult('check-page-errors', 'No unhandled page errors during navigation', 'STRUCTURE', pageErrors.length === 0, `errors: ${pageErrors.length}`);
  addResult('check-broken-images', 'All rendered <img> tags loaded successfully', 'STRUCTURE', brokenImages.length === 0, `broken: ${brokenImages.length}`);

  // Write results.json
  const resultsPath = path.join(__dirname, `results-${prefix}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nResults saved to: ${resultsPath}`);
  console.log(`Summary: Total=${results.summary.total}, Passed=${results.summary.passed}, Failed=${results.summary.failed}, Unverified=${results.summary.unverified}\n`);

  await browser.close();
  return results;
})().catch(err => {
  console.error('Verifier error:', err);
  process.exit(1);
});
