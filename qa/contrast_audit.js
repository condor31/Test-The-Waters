const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(rgb1, rgb2) {
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function parseRgb(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

async function auditContrast() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle' });

  const textNodes = await page.evaluate(() => {
    function getEffectiveBg(el) {
      let cur = el;
      while (cur && cur !== document.documentElement) {
        const bg = window.getComputedStyle(cur).backgroundColor;
        if (bg && bg !== 'transparent' && !bg.includes('rgba(0, 0, 0, 0)')) {
          return { bg, elTag: cur.tagName, elClass: cur.className };
        }
        cur = cur.parentElement;
      }
      return { bg: 'rgb(255, 255, 255)', elTag: 'HTML', elClass: '' };
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    const issues = [];
    const seen = new Set();

    while (walker.nextNode()) {
      const el = walker.currentNode;
      if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'DEFS', 'HEAD', 'NOSCRIPT'].includes(el.tagName)) continue;
      
      // Check if element has direct text or text children
      const text = el.innerText ? el.innerText.trim() : '';
      if (!text || text.length === 0) continue;
      
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
      
      const fg = style.color;
      const { bg } = getEffectiveBg(el);
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = style.fontWeight;
      const isBold = fontWeight === 'bold' || parseInt(fontWeight, 10) >= 700;
      const isLarge = fontSize >= 24 || (fontSize >= 18.66 && isBold);

      const key = `${el.tagName}.${el.className.split(' ').slice(0, 2).join('.')}:${fg}:${bg}:${fontSize}`;
      if (seen.has(key)) continue;
      seen.add(key);

      issues.push({
        tag: el.tagName,
        className: el.className,
        id: el.id,
        textSnippet: text.substring(0, 40).replace(/\s+/g, ' '),
        fg,
        bg,
        fontSize,
        fontWeight,
        isLarge
      });
    }
    return issues;
  });

  await browser.close();

  const contrastFailures = [];
  textNodes.forEach(item => {
    const fgRgb = parseRgb(item.fg);
    const bgRgb = parseRgb(item.bg);
    if (!fgRgb || !bgRgb) return;

    const ratio = getContrast(fgRgb, bgRgb);
    const req = item.isLarge ? 3.0 : 4.5;
    if (ratio < req) {
      contrastFailures.push({
        ...item,
        ratio: Math.round(ratio * 100) / 100,
        required: req
      });
    }
  });

  console.log(`\n=== Evaluated ${textNodes.length} Unique Text Styles ===`);
  console.log(`Contrast Failures Found: ${contrastFailures.length}\n`);
  contrastFailures.forEach(f => {
    console.log(`- <${f.tag} class="${f.className}"> "${f.textSnippet}"`);
    console.log(`  Ratio: ${f.ratio}:1 (Required: ${f.required}:1) | FG: ${f.fg} | BG: ${f.bg} | Size: ${f.fontSize}px`);
  });

  fs.writeFileSync(path.join(__dirname, 'contrast-failures.json'), JSON.stringify(contrastFailures, null, 2));
}

auditContrast().catch(err => {
  console.error(err);
  process.exit(1);
});
