const { chromium } = require("./node_modules/playwright");
const fs = require("fs");
const path = require("path");

const SCREEN_DIR = path.resolve(__dirname, "../ttw-v2-screens");
if (!fs.existsSync(SCREEN_DIR)) {
  fs.mkdirSync(SCREEN_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const results = {
    consoleErrors: [],
    pageErrors: [],
    ctas: [],
    disclaimers: {},
    horizontalOverflow: {},
    modulesScreenshots: [],
  };

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      results.consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    results.pageErrors.push(err.message);
  });

  console.log("Navigating to http://localhost:8080/ ...");
  await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });

  // 1. Full-page screenshot at 1440
  console.log("Capturing 1440 full page screenshot...");
  await page.screenshot({
    path: path.join(SCREEN_DIR, "full-1440.png"),
    fullPage: true,
  });

  // 2. Individual module screenshots at 1440
  const modules = [
    { id: "top", name: "01-hero-v2" },
    { id: "brand-anthem", name: "02-brand-anthem" },
    { id: "celebrities", name: "03-celebrities" },
    { id: "partners", name: "04-partner-logos" },
    { id: "reuse-loop", name: "05-reuse-loop" },
    { id: "whats-inside", name: "06-whats-inside" },
    { id: "social-proof", name: "07-social-proof" },
    { id: "where-next", name: "08-where-we-go-next" },
    { id: "how-it-works", name: "09-state-legislation" },
    { id: "why-it-matters", name: "10-why-it-matters" },
    { id: "press", name: "11-press" },
    { id: "use-of-proceeds", name: "12-use-of-proceeds" },
    { id: "leadership", name: "12b-leadership" },
    { id: "whats-next", name: "13-next-steps" },
    { id: "interested-form", name: "14-final-cta" },
    { selector: ".site-footer", name: "15-footer" },
  ];

  for (const mod of modules) {
    const el = mod.id ? await page.$(`#${mod.id}`) : await page.$(mod.selector);
    if (el) {
      const filePath = path.join(SCREEN_DIR, `module-${mod.name}-1440.png`);
      await el.screenshot({ path: filePath });
      results.modulesScreenshots.push({ name: mod.name, status: "captured", path: filePath });
    } else {
      results.modulesScreenshots.push({ name: mod.name, status: "not_found" });
    }
  }

  // 3. Mobile 390 full page screenshot
  console.log("Capturing 390 full page screenshot...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(SCREEN_DIR, "full-390.png"),
    fullPage: true,
  });

  // 4. Horizontal overflow check at 375
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(300);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  results.horizontalOverflow = {
    viewport: 375,
    scrollWidth,
    clientWidth,
    hasHorizontalScroll: scrollWidth > clientWidth,
  };

  // 5. Check CTAs
  await page.setViewportSize({ width: 1440, height: 900 });
  const ctaLinks = await page.$$eval("a.cta-label", (links) =>
    links.map((l) => ({
      text: l.textContent.trim(),
      href: l.getAttribute("href"),
      visible: l.offsetWidth > 0 && l.offsetHeight > 0,
    }))
  );
  results.ctas = ctaLinks;

  // 6. Check Disclaimers
  const heroDisclaimer = await page.$eval(".hero--v2 .rule-206-legend", (el) => !!el).catch(() => false);
  const footerDisclaimer = await page.$eval(".site-footer .site-footer__legal", (el) => !!el).catch(() => false);
  results.disclaimers = {
    underHeroCTA: heroDisclaimer,
    inFooter: footerDisclaimer,
  };

  // 7. Test Reduced Motion
  const reducedMotionContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const rmPage = await reducedMotionContext.newPage();
  await rmPage.goto("http://localhost:8080/", { waitUntil: "load" });
  const marqueeAnimation = await rmPage.$eval(".marquee", (el) => el.classList.contains("is-animating")).catch(() => false);
  results.reducedMotion = {
    marqueeAnimated: marqueeAnimation, // should be false
  };

  await browser.close();

  fs.writeFileSync(path.join(SCREEN_DIR, "qa-results.json"), JSON.stringify(results, null, 2));
  console.log("QA Finished. Results:", JSON.stringify(results, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
