const { chromium } = require('playwright');
const path = require('path');
const axeSource = require('axe-core').source;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });

  // Locate the technology card
  const techCard = page.locator('.os-card--technology');
  await techCard.scrollIntoViewIfNeeded();

  // Bounding box & computed style
  const imgPortion = page.locator('.os-card__image--technology');
  const bg = await imgPortion.evaluate(el => window.getComputedStyle(el).backgroundColor);
  const logo = page.locator('.os-card__image--technology .os-card__logo');
  const box = await imgPortion.boundingBox();
  const logoBox = await logo.boundingBox();

  console.log('Background color:', bg);
  console.log('Image container box:', box);
  console.log('Logo render box:', logoBox);

  // Take screenshot of technology card
  const screenshotPath = path.resolve(__dirname, 'screenshots/tech_card_desktop.png');
  await techCard.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  // Also take screenshot of carousel context
  const carouselSec = page.locator('.os-carousel-wrap');
  const carouselPath = path.resolve(__dirname, 'screenshots/carousel_section_desktop.png');
  await carouselSec.screenshot({ path: carouselPath });
  console.log('Saved carousel screenshot to:', carouselPath);

  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  await techCard.scrollIntoViewIfNeeded();
  const mobileScreenshotPath = path.resolve(__dirname, 'screenshots/tech_card_mobile.png');
  await techCard.screenshot({ path: mobileScreenshotPath });
  console.log('Saved mobile screenshot to:', mobileScreenshotPath);

  // Run Axe accessibility audit on the technology card
  await page.evaluate(axeSource);
  const axeResults = await page.evaluate(async () => {
    return await axe.run('.os-card--technology', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
      }
    });
  });
  console.log('Axe violations count on tech card:', axeResults.violations.length);
  if (axeResults.violations.length > 0) {
    console.log(JSON.stringify(axeResults.violations, null, 2));
  }

  await browser.close();
  console.log('Verification script completed successfully.');
})();
