const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });

  // Locate the service card
  const serviceCard = page.locator('.os-card:has-text("Service")');
  await serviceCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  // Take screenshot with default framing
  const defaultScreenshot = path.resolve(__dirname, 'screenshots/service_card_default.png');
  await serviceCard.screenshot({ path: defaultScreenshot });
  console.log('Saved default framing to:', defaultScreenshot);

  // Test object-position: center 65%
  await page.evaluate(() => {
    const img = document.querySelector('.os-card__image--service');
    if (img) img.style.objectPosition = 'center 65%';
  });
  const custom65Screenshot = path.resolve(__dirname, 'screenshots/service_card_65.png');
  await serviceCard.screenshot({ path: custom65Screenshot });
  console.log('Saved 65% framing to:', custom65Screenshot);

  // Test object-position: center 75%
  await page.evaluate(() => {
    const img = document.querySelector('.os-card__image--service');
    if (img) img.style.objectPosition = 'center 75%';
  });
  const custom75Screenshot = path.resolve(__dirname, 'screenshots/service_card_75.png');
  await serviceCard.screenshot({ path: custom75Screenshot });
  console.log('Saved 75% framing to:', custom75Screenshot);

  // Also full carousel screenshot showing both card 4 (tech) and card 5 (service)
  const carouselSec = page.locator('.os-carousel-wrap');
  const carouselScreenshot = path.resolve(__dirname, 'screenshots/carousel_service_test.png');
  await carouselSec.screenshot({ path: carouselScreenshot });
  console.log('Saved carousel screenshot to:', carouselScreenshot);

  await browser.close();
})();
