const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetUrl = process.argv[2] || 'http://localhost:8080/';
const outDir = process.argv[3] || path.join(__dirname, 'screenshots', 'audit-before');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { name: '320', width: 320, height: 568 },
  { name: '375', width: 375, height: 667 },
  { name: '414', width: 414, height: 896 },
  { name: '667x375_landscape', width: 667, height: 375 },
  { name: '768', width: 768, height: 1024 },
  { name: '900_inbetween', width: 900, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1024x500_short', width: 1024, height: 500 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 }
];

async function runAudit() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const report = {};

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Wait a moment for any initial layout / animations
    await page.waitForTimeout(500);

    // 1. Check Horizontal Overflow
    const overflowInfo = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;
      const hasOverflow = scrollWidth > docWidth || bodyScrollWidth > docWidth;

      const overflowingElements = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        // Skip hidden or zero-size
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        if (rect.right > docWidth + 1.5 || rect.left < -1.5) {
          overflowingElements.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            className: (el.className && typeof el.className === 'string') ? el.className.trim() : '',
            rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) },
            text: (el.innerText || '').slice(0, 40).replace(/\n/g, ' ')
          });
        }
      }

      return {
        docWidth,
        scrollWidth,
        bodyScrollWidth,
        hasOverflow,
        overflowDelta: Math.max(scrollWidth, bodyScrollWidth) - docWidth,
        overflowingElements: overflowingElements.slice(0, 20) // top 20
      };
    });

    // 2. Check Input Font Sizes (< 16px causes iOS zoom)
    const inputFontSizes = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
      const under16 = [];
      inputs.forEach(inp => {
        const style = window.getComputedStyle(inp);
        const size = parseFloat(style.fontSize);
        if (size < 15.9) {
          under16.push({
            id: inp.id,
            name: inp.name,
            type: inp.type,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight
          });
        }
      });
      return under16;
    });

    // 3. Check Tap Targets (< 44x44)
    const tapTargets = await page.evaluate(() => {
      const interactives = document.querySelectorAll('button, a, input:not([type="hidden"]), select, [role="button"]');
      const small = [];
      interactives.forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
        if (rect.width === 0 || rect.height === 0) return;
        // Ignore links inline in paragraphs if they wrap text
        if (rect.width < 43 || rect.height < 43) {
          small.push({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className: (el.className && typeof el.className === 'string') ? el.className.trim() : '',
            text: (el.innerText || el.getAttribute('aria-label') || el.value || '').trim().slice(0, 30),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          });
        }
      });
      return small;
    });

    // 4. Check Persistent / Sticky CTA positioning & covering
    const fixedElements = await page.evaluate(() => {
      const fixed = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'sticky') {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
            fixed.push({
              tag: el.tagName.toLowerCase(),
              id: el.id,
              className: (el.className && typeof el.className === 'string') ? el.className.trim() : '',
              position: style.position,
              top: rect.top,
              bottom: rect.bottom,
              height: rect.height,
              zIndex: style.zIndex
            });
          }
        }
      }
      return fixed;
    });

    // 5. Screenshot Full Page
    const screenshotPath = path.join(outDir, `viewport_${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Also take above-the-fold hero screenshot
    const heroScreenshotPath = path.join(outDir, `viewport_${vp.name}_hero.png`);
    await page.screenshot({ path: heroScreenshotPath, fullPage: false });

    report[vp.name] = {
      viewport: vp,
      overflowInfo,
      inputFontSizes,
      smallTapTargetCount: tapTargets.length,
      smallTapTargets: tapTargets,
      fixedElements
    };

    await page.close();
  }

  // Also test interactive states:
  // State A: Video player playing state on 375 and 1280
  const videoPage = await browser.newPage();
  await videoPage.setViewportSize({ width: 375, height: 667 });
  await videoPage.goto(targetUrl, { waitUntil: 'networkidle' });
  const playBtn = await videoPage.$('.interest-card__video-thumb-btn');
  if (playBtn) {
    await playBtn.click();
    await videoPage.waitForTimeout(500);
    await videoPage.screenshot({ path: path.join(outDir, 'state_video_playing_375.png'), fullPage: false });
  }
  await videoPage.close();

  // State B: Form validation error state
  const formPage = await browser.newPage();
  await formPage.setViewportSize({ width: 375, height: 667 });
  await formPage.goto(targetUrl, { waitUntil: 'networkidle' });
  const submitBtn = await formPage.$('#hero-subscribe-btn');
  if (submitBtn) {
    await submitBtn.click();
    await formPage.waitForTimeout(300);
    await formPage.screenshot({ path: path.join(outDir, 'state_form_error_375.png'), fullPage: false });
  }
  await formPage.close();

  // State C: Bottom form with radio selection
  const bottomFormPage = await browser.newPage();
  await bottomFormPage.setViewportSize({ width: 375, height: 667 });
  await bottomFormPage.goto(targetUrl, { waitUntil: 'networkidle' });
  await bottomFormPage.evaluate(() => {
    document.getElementById('interested-form')?.scrollIntoView();
  });
  await bottomFormPage.waitForTimeout(500);
  await bottomFormPage.screenshot({ path: path.join(outDir, 'state_bottom_form_375.png'), fullPage: false });
  await bottomFormPage.close();

  await browser.close();

  const reportPath = path.join(outDir, 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('Audit completed. Report saved to ' + reportPath);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
