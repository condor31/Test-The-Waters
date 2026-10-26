const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetUrl = 'http://localhost:8080/';
const outDir = path.join(__dirname, 'screenshots', 'section-crops-after');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { name: '320', width: 320, height: 600 },
  { name: '375', width: 375, height: 667 },
  { name: '667x375_land', width: 667, height: 375 },
  { name: '768', width: 768, height: 1024 },
  { name: '900', width: 900, height: 800 },
  { name: '1024x500_short', width: 1024, height: 500 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 }
];

const sections = [
  { id: 'announcement-bar', selector: '#announcement-bar', name: 'announcement' },
  { id: 'hero', selector: '.hero', name: 'hero' },
  { id: 'interested', selector: '#interested', name: 'hero_card' },
  { id: 'slide-arrows', selector: '.slide-arrow--cyan', name: 'slide_arrows' },
  { id: 'mid-cta', selector: '.mid-page-cta', name: 'mid_cta' },
  { id: 'how-it-works', selector: '#how-it-works', name: 'map_section' },
  { id: 'impact-stripes', selector: '.impact-stripes-wrap', name: 'impact_stripes' },
  { id: 'loops', selector: '.loop-diagrams', name: 'loops' },
  { id: 'why-now', selector: '.why-now-section', name: 'why_now' },
  { id: 'partner-logos', selector: '.partner-logos-section', name: 'partner_logos' },
  { id: 'os', selector: '.os-carousel-wrap', name: 'os_carousel' },
  { id: 'jobs', selector: '.jobs-panel', name: 'jobs_panel' },
  { id: 'leadership', selector: '.carousel-wrap', name: 'leadership' },
  { id: 'whats-next', selector: '#whats-next', name: 'whats_next' },
  { id: 'interested-form', selector: '#interested-form', name: 'bottom_form' },
  { id: 'sources', selector: '#sources-section', name: 'sources' },
  { id: 'footer', selector: '.site-footer', name: 'footer' }
];

async function inspect() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const findings = [];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Section bounding boxes and overflow
    for (const sec of sections) {
      const el = await page.$(sec.selector);
      if (!el) continue;

      const box = await el.boundingBox();
      if (!box) continue;

      // Crop screenshot for 320, 375, 768, 1280
      if (['320', '375', '768', '1280'].includes(vp.name)) {
        try {
          await el.screenshot({ path: path.join(outDir, `${sec.name}_${vp.name}.png`) });
        } catch (e) {
          // If element too tall or offscreen, take clip
        }
      }

      if (box.width > vp.width + 1) {
        findings.push({
          type: 'SECTION_OVERFLOW',
          viewport: vp.name,
          section: sec.name,
          boxWidth: box.width,
          vpWidth: vp.width,
          delta: box.width - vp.width
        });
      }
    }

    // Check specific responsive layout issues in DOM:
    const layoutIssues = await page.evaluate((vpWidth) => {
      const issues = [];

      // Check text clipping or overflow
      document.querySelectorAll('h1, h2, h3, h4, h5, p, span, a, button').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
          const style = window.getComputedStyle(el);
          if (style.overflow !== 'visible' || style.textOverflow === 'ellipsis') {
            // Check if intended ellipsis
          } else if (style.whiteSpace === 'nowrap' || style.display === 'inline-block' || style.display === 'block') {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              issues.push({
                type: 'TEXT_OVERFLOW',
                tag: el.tagName.toLowerCase(),
                className: el.className,
                text: el.innerText.slice(0, 30),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth
              });
            }
          }
        }
      });

      // Check buttons or links with bad line-height or text overflow
      document.querySelectorAll('.btn, button').forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.right > vpWidth + 1 || rect.left < -1) {
          issues.push({
            type: 'BUTTON_OVERFLOW',
            className: btn.className,
            text: btn.innerText.slice(0, 30),
            rect: { left: rect.left, right: rect.right, width: rect.width }
          });
        }
      });

      // Check hero heading and interest card overlap or collision
      const heroHeading = document.querySelector('.hero__heading');
      const interestCard = document.querySelector('.interest-card');
      if (heroHeading && interestCard) {
        const headingRect = heroHeading.getBoundingClientRect();
        const cardRect = interestCard.getBoundingClientRect();
        // Check if card overlaps heading
        const overlap = !(headingRect.right < cardRect.left || 
                          headingRect.left > cardRect.right || 
                          headingRect.bottom < cardRect.top || 
                          headingRect.top > cardRect.bottom);
        issues.push({
          type: 'HERO_LAYOUT',
          headingRect: { top: headingRect.top, bottom: headingRect.bottom, left: headingRect.left, right: headingRect.right, width: headingRect.width },
          cardRect: { top: cardRect.top, bottom: cardRect.bottom, left: cardRect.left, right: cardRect.right, width: cardRect.width },
          overlap
        });
      }

      // Check persistent CTA bar behavior
      const persistentCta = document.querySelector('#persistent-cta');
      if (persistentCta) {
        const ctaRect = persistentCta.getBoundingClientRect();
        issues.push({
          type: 'PERSISTENT_CTA',
          height: ctaRect.height,
          bottom: ctaRect.bottom
        });
      }

      return issues;
    }, vp.width);

    findings.push(...layoutIssues.map(i => ({ ...i, viewport: vp.name })));
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'inspection_summary.json'), JSON.stringify(findings, null, 2));
  console.log('Inspection complete. Summary saved.');
}

inspect().catch(console.error);
