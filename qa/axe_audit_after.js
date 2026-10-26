const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const axeSource = require('axe-core').source;

async function runAxeScan() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  // Set viewport to standard desktop
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle' });

  // Inject axe-core
  await page.evaluate(axeSource);

  // Run axe on default state
  const defaultResults = await page.evaluate(async () => {
    return await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
      }
    });
  });

  // Test interactive state 1: trigger hero form validation error
  await page.click('#hero-subscribe-btn');
  await page.waitForTimeout(300);

  const heroFormErrorResults = await page.evaluate(async () => {
    return await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
      }
    });
  });

  // Test interactive state 2: open video player
  const videoBtn = await page.$('.interest-card__video-thumb-btn');
  if (videoBtn) {
    await videoBtn.click();
    await page.waitForTimeout(500);
  }

  const videoOpenResults = await page.evaluate(async () => {
    return await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
      }
    });
  });

  await browser.close();

  const report = {
    timestamp: new Date().toISOString(),
    defaultState: {
      violationsCount: defaultResults.violations.length,
      violations: defaultResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        tags: v.tags,
        nodesCount: v.nodes.length,
        nodes: v.nodes.map(n => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary
        }))
      })),
      incompleteCount: defaultResults.incomplete.length,
      incomplete: defaultResults.incomplete.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodesCount: v.nodes.length
      })),
      passesCount: defaultResults.passes.length
    },
    heroFormErrorState: {
      violationsCount: heroFormErrorResults.violations.length,
      violations: heroFormErrorResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodesCount: v.nodes.length,
        nodes: v.nodes.map(n => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary
        }))
      }))
    },
    videoOpenState: {
      violationsCount: videoOpenResults.violations.length,
      violations: videoOpenResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodesCount: v.nodes.length,
        nodes: v.nodes.map(n => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary
        }))
      }))
    }
  };

  const outputPath = path.join(__dirname, 'axe-results-after.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  // Load before results
  const beforePath = path.join(__dirname, 'axe-results-before.json');
  let before = null;
  if (fs.existsSync(beforePath)) {
    before = JSON.parse(fs.readFileSync(beforePath, 'utf8'));
  }

  console.log(`\n======================================================`);
  console.log(`=== AXE ACCESSIBILITY AUDIT: BEFORE vs AFTER COMPARISON ===`);
  console.log(`======================================================`);
  console.log(`Default State:`);
  console.log(`  Before Violations: ${before ? before.defaultState.violationsCount : 'N/A'}`);
  console.log(`  After Violations:  ${report.defaultState.violationsCount}`);
  if (report.defaultState.violationsCount > 0) {
    report.defaultState.violations.forEach(v => {
      console.log(`  - [${v.impact.toUpperCase()}] ${v.id} (${v.nodesCount} nodes): ${v.help}`);
    });
  } else {
    console.log(`  -> 0 violations! (Passes: ${report.defaultState.passesCount})`);
  }

  console.log(`\nHero Form Error State:`);
  console.log(`  Before Violations: ${before ? before.heroFormErrorState.violationsCount : 'N/A'}`);
  console.log(`  After Violations:  ${report.heroFormErrorState.violationsCount}`);
  if (report.heroFormErrorState.violationsCount > 0) {
    report.heroFormErrorState.violations.forEach(v => {
      console.log(`  - [${v.impact.toUpperCase()}] ${v.id} (${v.nodesCount} nodes): ${v.help}`);
    });
  }

  console.log(`\nVideo Open State:`);
  console.log(`  Before Violations: ${before ? before.videoOpenState.violationsCount : 'N/A'}`);
  console.log(`  After Violations:  ${report.videoOpenState.violationsCount}`);
  if (report.videoOpenState.violationsCount > 0) {
    report.videoOpenState.violations.forEach(v => {
      console.log(`  - [${v.impact.toUpperCase()}] ${v.id} (${v.nodesCount} nodes): ${v.help}`);
    });
  }

  console.log(`\nSaved report to: ${outputPath}\n`);
}

runAxeScan().catch(err => {
  console.error(err);
  process.exit(1);
});
