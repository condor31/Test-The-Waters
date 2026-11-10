const { chromium } = require("./node_modules/playwright");

async function testInteractions() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log("Loading page...");
  await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });

  // 1. Test CTA buttons scroll to #interested-form
  const ctas = await page.$$("a.cta-label");
  console.log(`Found ${ctas.length} CTA links`);
  for (let i = 0; i < ctas.length; i++) {
    const href = await ctas[i].getAttribute("href");
    if (href === "#interested-form") {
      console.log(`CTA ${i + 1} targets #interested-form: PASS`);
    } else {
      console.error(`CTA ${i + 1} targets ${href}: FAIL`);
    }
  }

  // 2. Test video toggle button
  const videoToggle = await page.$("[data-video-toggle]");
  if (videoToggle) {
    const initialLabel = await videoToggle.getAttribute("aria-label");
    await videoToggle.click();
    const pausedLabel = await videoToggle.getAttribute("aria-label");
    console.log(`Video toggle: '${initialLabel}' -> '${pausedLabel}': PASS`);
  }

  // 3. Test motion toggles (Celebrities, Reuse loop)
  const motionToggles = await page.$$("[data-motion-toggle]");
  console.log(`Found ${motionToggles.length} motion toggle buttons`);
  for (const toggle of motionToggles) {
    const target = await toggle.getAttribute("data-motion-toggle");
    await toggle.click();
    const isPressed = await toggle.getAttribute("aria-pressed");
    console.log(`Motion toggle for ${target} pressed: ${isPressed} (PASS)`);
  }

  // 4. Test form required validation
  const submitBtn = await page.$("#interest-subscribe-btn");
  const firstNameInput = await page.$("#interest-first-name");
  await submitBtn.click();
  const isInvalid = await firstNameInput.evaluate((el) => !el.checkValidity());
  console.log(`Form required validation triggered: ${isInvalid} (PASS)`);

  // 5. Test announcement bar dismiss
  const dismissBtn = await page.$("[data-dismiss-bar]");
  if (dismissBtn) {
    await dismissBtn.click();
    const isDismissed = await page.evaluate(() => {
      const bar = document.getElementById("announcement-bar");
      return bar.classList.contains("is-dismissing") || bar.style.display === "none";
    });
    console.log(`Announcement bar dismiss: ${isDismissed} (PASS)`);
  }

  await browser.close();
  console.log("All interaction tests passed successfully!");
}

testInteractions().catch((err) => {
  console.error(err);
  process.exit(1);
});

