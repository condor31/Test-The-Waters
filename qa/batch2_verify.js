// Batch 2 verification (T22-T37). Run with the local server up on :8080:  node qa/batch2_verify.js
const { chromium } = require("./node_modules/playwright");
const fs = require("fs");
const path = require("path");

const OUT = path.resolve(__dirname, "../scratch/batch2");
fs.mkdirSync(OUT, { recursive: true });
const URL = "http://localhost:8080/";
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  -> " + detail : ""}`);
};

async function launch() {
  return chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

async function newPage(browser, width, height, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  return { page, errors, ctx };
}

(async () => {
  const browser = await launch();

  for (const vp of [
    { w: 375, h: 812, n: "375" },
    { w: 414, h: 896, n: "414" },
    { w: 1280, h: 800, n: "1280" },
    { w: 1440, h: 900, n: "1440" },
  ]) {
    console.log(`\n=== viewport ${vp.n} ===`);
    const { page, errors, ctx } = await newPage(browser, vp.w, vp.h);

    // --- overflow / console
    const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    check(`[${vp.n}] no horizontal overflow`, ov.sw <= ov.cw, JSON.stringify(ov));

    // --- T22 / T23 hero
    const hero = await page.evaluate(() => {
      const li = [...document.querySelectorAll(".hero-pre-reel .hero-v2__stat")];
      return {
        labels: li.map((e) => e.getAttribute("aria-label")),
        textTransform: getComputedStyle(li[0].querySelector(".hero-v2__stat-text")).textTransform,
        supCount: document.querySelectorAll(".hero-pre-reel sup").length,
        supInLast: !!li[3].querySelector("sup.hero-fn a"),
        supHref: document.querySelector(".hero-fn a")?.getAttribute("href"),
      };
    });
    check(`[${vp.n}] T22 lead stat label`, hero.labels[0] === "30M single-use cups eliminated.", hero.labels[0]);
    check(`[${vp.n}] T22 no text-transform on lead stat`, hero.textTransform === "none", hero.textTransform);
    check(`[${vp.n}] T23 exactly one hero superscript, on the 10,000+ stat`, hero.supCount === 1 && hero.supInLast, JSON.stringify(hero));
    check(`[${vp.n}] T23 hero ref labels`, hero.labels[3] === "10,000+ LIVE EVENTS", hero.labels[3]);

    // hero lead stat fits the viewport (wraps instead of overflowing)
    const fit = await page.evaluate(() => {
      const t = document.querySelector(".hero-pre-reel .hero-v2__stat.is-active .hero-v2__stat-text");
      const r = t.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), vw: window.innerWidth };
    });
    check(`[${vp.n}] T22 lead stat inside viewport`, fit.left >= 0 && fit.right <= fit.vw, JSON.stringify(fit));
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, `hero-lead-${vp.n}.png`) });

    // Show the 4th stat (with the footnote mark) deterministically
    await page.evaluate(() => {
      const stats = [...document.querySelectorAll(".hero-pre-reel .hero-v2__stat")];
      stats.forEach((s) => s.classList.remove("is-active", "is-leaving"));
      stats[3].classList.add("is-active");
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, `hero-footnote-${vp.n}.png`) });

    // --- footnote numbering / anchors (T23 + rule 8)
    const fn = await page.evaluate(() => {
      const refs = [...document.querySelectorAll('sup a[href^="#fn"]')];
      const seen = [];
      const problems = [];
      refs.forEach((a) => {
        const n = parseInt(a.getAttribute("href").replace("#fn", ""), 10);
        if (a.textContent.trim() !== String(n)) problems.push(`text ${a.textContent} != href ${n}`);
        if (!document.getElementById("fn" + n)) problems.push(`missing #fn${n}`);
        if (!a.id || !document.getElementById(a.id)) problems.push(`ref no id ${n}`);
        const back = document.querySelector(`#fn${n} a.fn-backref`);
        if (!back) problems.push(`no backref for ${n}`);
        else if (!document.getElementById(back.getAttribute("href").slice(1))) problems.push(`backref target missing ${n}`);
        if (!seen.includes(n)) seen.push(n);
      });
      const firstOrder = seen.slice();
      const sorted = seen.slice().sort((x, y) => x - y);
      const listIds = [...document.querySelectorAll("#sources-list > li")].map((li) => li.id);
      return { firstOrder, inOrder: JSON.stringify(firstOrder) === JSON.stringify(sorted), listIds, problems, fn1: document.getElementById("fn1")?.innerText };
    });
    check(`[${vp.n}] footnotes numbered in first-appearance order`, fn.inOrder, fn.firstOrder.join(","));
    check(`[${vp.n}] footnote anchors/backrefs resolve`, fn.problems.length === 0, fn.problems.join("; "));
    check(`[${vp.n}] sources list is fn1..fn${fn.listIds.length} in order`, fn.listIds.join() === fn.listIds.map((_, i) => "fn" + (i + 1)).join());
    if (vp.n === "1440") {
      check("T23 fn1 holds the four old TTW notes (30M items / cities / states / events)",
        /Reusable items delivered/.test(fn.fn1) && /Cities with at least one/.test(fn.fn1) && /States with at least one/.test(fn.fn1) && /Events served/.test(fn.fn1));
    }

    // --- T25 marquee
    const mq = await page.evaluate(async () => {
      const m = document.querySelector("[data-marquee]");
      const track = m.querySelector("[data-marquee-track]");
      const cards = [...track.children];
      const n = cards.length / 2;
      const a = cards[0].getBoundingClientRect().left, b = cards[n].getBoundingClientRect().left;
      const anim = track.getAnimations()[0];
      const timing = anim ? anim.effect.getComputedTiming() : null;
      const dist = parseFloat(getComputedStyle(m).getPropertyValue("--marquee-distance"));
      const setWidth = b - a;
      return {
        n, cards: cards.length, setWidth, dist, duration: timing?.duration, // ms
        speed: timing ? Math.abs(dist) / (timing.duration / 1000) : null,
        cloneHidden: cards.slice(n).every((c) => c.getAttribute("aria-hidden") === "true"),
        origHidden: cards.slice(0, n).some((c) => c.hasAttribute("aria-hidden")),
        gapAtSeam: cards[n].getBoundingClientRect().left - cards[n - 1].getBoundingClientRect().right,
        gapInside: cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().right,
        hasPadding: getComputedStyle(track).paddingLeft,
      };
    });
    check(`[${vp.n}] T25 loop distance == one set width (no seam jump)`, Math.abs(Math.abs(mq.dist) - mq.setWidth) < 0.6, `${mq.dist} vs ${mq.setWidth}`);
    check(`[${vp.n}] T25 gap at seam == gap between cards`, Math.abs(mq.gapAtSeam - mq.gapInside) < 0.6, `${mq.gapAtSeam} vs ${mq.gapInside}`);
    check(`[${vp.n}] T25 duplicate set aria-hidden, originals exposed`, mq.cloneHidden && !mq.origHidden);
    check(`[${vp.n}] T25 constant ~60px/s`, Math.abs(mq.speed - 60) < 1, `${mq.speed?.toFixed(2)} px/s`);

    // seam test over 3 full cycles: seek the animation and compare card positions to t=0
    const cycles = await page.evaluate(async () => {
      const track = document.querySelector("[data-marquee-track]");
      const anim = track.getAnimations()[0];
      anim.pause();
      const dur = anim.effect.getComputedTiming().duration;
      const lefts = [];
      for (const k of [0, 1, 2, 3]) {
        anim.currentTime = dur * k + 0.001;
        await new Promise((r) => requestAnimationFrame(r));
        lefts.push(Math.round(track.children[0].getBoundingClientRect().left * 10) / 10);
      }
      // just before the loop point vs just after: the 2nd copy of card 0 must sit where card 0 starts
      anim.currentTime = dur - 0.001;
      await new Promise((r) => requestAnimationFrame(r));
      const n = track.children.length / 2;
      const preLoop = Math.round(track.children[n].getBoundingClientRect().left * 10) / 10;
      anim.currentTime = dur + 0.001;
      await new Promise((r) => requestAnimationFrame(r));
      const postLoop = Math.round(track.children[0].getBoundingClientRect().left * 10) / 10;
      anim.play();
      return { lefts, preLoop, postLoop };
    });
    check(`[${vp.n}] T25 identical position at the start of cycles 1-4`, cycles.lefts.every((l) => Math.abs(l - cycles.lefts[0]) < 0.6), cycles.lefts.join(","));
    check(`[${vp.n}] T25 no snap at the loop point`, Math.abs(cycles.preLoop - cycles.postLoop) < 0.6, `${cycles.preLoop} -> ${cycles.postLoop}`);

    // hover pauses
    await page.locator("[data-marquee]").scrollIntoViewIfNeeded();
    await page.locator("[data-marquee]").hover();
    const paused = await page.evaluate(() => getComputedStyle(document.querySelector("[data-marquee-track]")).animationPlayState);
    check(`[${vp.n}] T25 pauses on hover`, paused === "paused", paused);
    await page.mouse.move(0, 0);
    await page.screenshot({ path: path.join(OUT, `marquee-${vp.n}.png`) });

    // --- T27 + T26 venue cards
    const venues = await page.$$eval(".venue-card__name", (els) => els.map((e) => e.textContent.trim()));
    const expectedVenues = ["Sphere", "Red Rocks Amphitheatre", "Merriweather Post Pavilion", "LA Memorial Coliseum", "CHS Field", "Crypto.com Arena"];
    check(`[${vp.n}] T27 venue order (DOM)`, venues.join("|") === expectedVenues.join("|"), venues.join(" | "));
    const stats = await page.$$eval(".venue-card", (cs) => cs.map((c) => c.querySelector(".venue-card__name").textContent.trim() + " = " + c.querySelector(".venue-card__stat").textContent.trim()));
    if (vp.n === "1440") console.log("   venue cards:", stats);

    // --- T30 press
    const press = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".press-logo__card")];
      const cs = (c) => getComputedStyle(c);
      return {
        n: cards.length,
        boxed: cards.some((c) => cs(c).borderTopWidth !== "0px" || cs(c).boxShadow !== "none" || (cs(c).backgroundColor !== "rgba(0, 0, 0, 0)")),
        pointer: cards.some((c) => cs(c).cursor === "pointer"),
        links: document.querySelectorAll("#press a, #press [tabindex], #press button").length,
        alts: [...document.querySelectorAll("#press img")].map((i) => i.alt),
      };
    });
    check(`[${vp.n}] T30 press logos: no box/border/shadow/background`, press.n === 8 && !press.boxed, JSON.stringify({ n: press.n, boxed: press.boxed }));
    check(`[${vp.n}] T30 press logos: no links/pointer/tab stops`, press.links === 0 && !press.pointer);
    check(`[${vp.n}] T30 press alt text present`, press.alts.every((a) => /logo$/i.test(a)), press.alts.join(", "));
    await page.locator("#press").scrollIntoViewIfNeeded();
    await page.locator("#press").screenshot({ path: path.join(OUT, `press-${vp.n}.png`) });

    // --- T32 proceeds
    const pr = await page.evaluate(() => {
      const cards = [...document.querySelectorAll(".proceeds-card")];
      const rects = cards.map((c) => c.getBoundingClientRect());
      const rows = {};
      rects.forEach((r) => (rows[Math.round(r.top)] = (rows[Math.round(r.top)] || []).concat(Math.round(r.height))));
      return {
        n: cards.length,
        titles: cards.map((c) => c.querySelector("h3").textContent.trim()),
        rows,
        widths: rects.map((r) => Math.round(r.width)),
      };
    });
    check(`[${vp.n}] T32 four boxes in order`, pr.n === 4 && pr.titles.join("|") === ["More Sanitization Centers", "Deeper Automation", "Legislation Is Here, and More Is Coming", "Reuse Expands Into Consumer Packaged Goods"].join("|"));
    check(`[${vp.n}] T32 equal heights per row`, Object.values(pr.rows).every((hs) => hs.every((h) => Math.abs(h - hs[0]) <= 1)), JSON.stringify(pr.rows));
    check(`[${vp.n}] T32 equal widths`, pr.widths.every((w) => Math.abs(w - pr.widths[0]) <= 1), pr.widths.join(","));
    await page.locator("#use-of-proceeds").scrollIntoViewIfNeeded();
    await page.locator("#use-of-proceeds").screenshot({ path: path.join(OUT, `proceeds-${vp.n}.png`) });

    // --- T31 / T36 team
    const team = await page.$$eval(".carousel--leader .leader-card__name", (els) => els.map((e) => e.textContent.trim()));
    const expectedTeam = ["Michael Martin", "Grace Lee", "Craig Swanson", "Annie Wesen", "Tim Webert", "Ed DeFraine", "Mac Sellars", "Kate Rusciano", "Jess Haap", "Tom Sellars", "Daniel Yarano", "Kari Niedfeldt-Thomas", "Mark Addicks", "Brian Yost"];
    check(`[${vp.n}] T31 team order`, team.join("|") === expectedTeam.join("|"), team.join(" | "));
    const fields = await page.$$eval(".carousel--leader .carousel__slide", (els) =>
      els.map((e) => ({ img: e.querySelector("img").alt, name: e.querySelector(".leader-card__name").textContent.trim() })));
    check(`[${vp.n}] T31 photo alt matches name on every slide`, fields.every((f) => f.img === f.name));
    if (vp.n === "1440") {
      const tom = await page.$$eval(".carousel--leader .carousel__slide", (els) => {
        const s = els.find((e) => e.querySelector(".leader-card__name").textContent.trim() === "Tom Sellars");
        return s.querySelector("p:not(.leader-card__title)").innerText;
      });
      check("T36 Tom's bio last line", /Founder and Chair of Concerts For the Environment\.?$/.test(tom.trim()), JSON.stringify(tom));
    }

    // --- T37 rendered
    const sub = await page.$eval("#celebrities .module-head__sub", (e) => e.textContent);
    check(`[${vp.n}] T37 rendered celeb sub copy`, sub === "From courtside to front-row center, r.World\u2019s reusable r.Cups, plates and other foodware are in the hands of some of your favorite celebrities.", sub);

    // --- T29 loop logo
    const loop = await page.evaluate(() => {
      const img = document.querySelector(".reuse-loop__mark");
      const r = img.getBoundingClientRect();
      const nodes = [...document.querySelectorAll(".loop-node")].map((n) => n.getBoundingClientRect());
      const overlaps = nodes.filter((n) => !(n.right < r.left || n.left > r.right || n.bottom < r.top || n.top > r.bottom)).length;
      return { alt: img.alt, w: Math.round(r.width), h: Math.round(r.height), overlaps, loaded: img.complete && img.naturalWidth > 0 };
    });
    check(`[${vp.n}] T29 loop logo alt/loaded/no overlap`, loop.alt === "r.World" && loop.loaded && loop.overlaps === 0, JSON.stringify(loop));
    await page.locator("#reuse-loop").scrollIntoViewIfNeeded();
    await page.locator("#reuse-loop").screenshot({ path: path.join(OUT, `loop-${vp.n}.png`) });

    check(`[${vp.n}] no console/page errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  // ---------- T28 floating form ----------
  for (const vp of [{ w: 1440, h: 900, n: "1440" }, { w: 375, h: 812, n: "375" }]) {
    console.log(`\n=== floating form ${vp.n} ===`);
    const { page, errors, ctx } = await newPage(browser, vp.w, vp.h);
    // Never hit production: intercept Mailchimp + backup sheet and record what is sent.
    const sent = { mc: [], sheet: [] };
    await page.route(/list-manage\.com\/subscribe\/post-json/, (route) => {
      const u = new globalThis.URL(route.request().url());
      sent.mc.push({ origin: u.origin + u.pathname, params: Object.fromEntries(u.searchParams) });
      const cb = u.searchParams.get("c");
      route.fulfill({ status: 200, contentType: "application/javascript", body: `${cb}({"result":"success","msg":"ok"})` });
    });
    await page.route(/script\.google\.com/, (route) => {
      sent.sheet.push(route.request().url());
      route.fulfill({ status: 200, body: "ok" });
    });

    await page.locator("#partners").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const bar = await page.evaluate(() => {
      const cta = document.getElementById("persistent-cta");
      const btn = cta.querySelector("[data-float-open]");
      return { visible: !cta.classList.contains("is-hidden"), tag: btn.tagName, href: btn.getAttribute("href"), deadLinks: document.querySelectorAll('#persistent-cta a[href="#interested-form"]').length };
    });
    check(`[${vp.n}] T28 trigger is a button (old dead-end link gone), bar visible mid-page`, bar.visible && bar.tag === "BUTTON" && !bar.href && bar.deadLinks === 0, JSON.stringify(bar));
    const y0 = await page.evaluate(() => window.scrollY);
    await page.click("[data-float-open]");
    await page.waitForTimeout(400);
    const open = await page.evaluate(() => ({
      open: document.getElementById("floating-form-dialog").open,
      active: document.activeElement?.id || document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName,
      y: window.scrollY,
      modal: document.getElementById("floating-form-dialog").matches(":modal"),
    }));
    check(`[${vp.n}] T28 opens in place without scroll jump`, open.open && open.modal && Math.abs(open.y - y0) < 2, JSON.stringify(open));
    await page.screenshot({ path: path.join(OUT, `float-open-${vp.n}.png`) });

    // focus trap: tab through more times than there are controls; focus must stay inside the dialog
    let escaped = false;
    for (let i = 0; i < 18; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest("#floating-form-dialog"));
      if (!inside) escaped = true;
    }
    check(`[${vp.n}] T28 focus trapped while open`, !escaped);

    // labels / aria
    const a11y = await page.evaluate(() => {
      const d = document.getElementById("floating-form-dialog");
      const inputs = [...d.querySelectorAll("input:not([type=hidden]):not([tabindex='-1'])")];
      return {
        labelledby: d.getAttribute("aria-labelledby"),
        titleOk: !!document.getElementById(d.getAttribute("aria-labelledby"))?.textContent,
        unlabeled: inputs.filter((i) => !(i.labels && i.labels.length)).map((i) => i.id || i.name),
        closeLabel: d.querySelector("[data-float-close]").getAttribute("aria-label"),
      };
    });
    check(`[${vp.n}] T28 dialog labelled, all fields have labels, close has aria-label`, a11y.titleOk && a11y.unlabeled.length === 0 && !!a11y.closeLabel, JSON.stringify(a11y));

    // validation (error state inline = native validity + role=alert region)
    await page.click("#floating-subscribe-btn");
    const invalid = await page.evaluate(() => !document.getElementById("floating-first-name").checkValidity());
    check(`[${vp.n}] T28 required-field validation blocks submit`, invalid);

    // Esc closes + focus returns to the trigger
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
    const afterEsc = await page.evaluate(() => ({ open: document.getElementById("floating-form-dialog").open, focus: document.activeElement?.hasAttribute("data-float-open") }));
    check(`[${vp.n}] T28 Esc closes and focus returns to trigger`, !afterEsc.open && afterEsc.focus, JSON.stringify(afterEsc));

    // X closes
    await page.click("[data-float-open]");
    await page.waitForTimeout(200);
    await page.click("[data-float-close]");
    await page.waitForTimeout(200);
    check(`[${vp.n}] T28 X button closes`, !(await page.evaluate(() => document.getElementById("floating-form-dialog").open)));

    // Test submission (intercepted) and comparison with the main form's pipeline
    await page.click("[data-float-open]");
    await page.fill("#floating-first-name", "Test");
    await page.fill("#floating-last-name", "Person");
    await page.fill("#floating-email", "qa+batch2@example.com");
    await page.fill("#floating-phone", "(555) 123-4567");
    await page.check("#floating-range-1", { force: true });
    await page.click("#floating-subscribe-btn");
    await page.waitForTimeout(900);
    const succ = await page.evaluate(() => ({ success: !document.getElementById("floating-form-success").hidden, formHidden: document.getElementById("floating-interest-form").hidden }));
    check(`[${vp.n}] T28 success state shows inline`, succ.success && succ.formHidden, JSON.stringify(succ));
    await page.screenshot({ path: path.join(OUT, `float-success-${vp.n}.png`) });
    await page.keyboard.press("Escape");

    // main form through the same intercepts for comparison
    await page.evaluate(() => document.getElementById("interested-form").scrollIntoView());
    await page.fill("#interest-first-name", "Test");
    await page.fill("#interest-last-name", "Person");
    await page.fill("#interest-email", "qa+batch2@example.com");
    await page.fill("#interest-phone", "(555) 123-4567");
    await page.check("#mce-MMERGE51", { force: true });
    await page.click("#interest-subscribe-btn");
    await page.waitForTimeout(900);
    const [fl, mn] = sent.mc;
    check(`[${vp.n}] T28 submission reached Mailchimp (intercepted, not sent live)`, sent.mc.length === 2 && fl && mn, `requests=${sent.mc.length}`);
    if (fl && mn) {
      check(`[${vp.n}] T28 same endpoint as main form`, fl.origin === mn.origin, fl.origin);
      const strip = (o) => { const c = { ...o }; delete c.c; return c; };
      check(`[${vp.n}] T28 identical field names/values as main form`, JSON.stringify(strip(fl.params)) === JSON.stringify(strip(mn.params)), JSON.stringify(strip(fl.params)));
    }
    check(`[${vp.n}] T28 backup sheet pinged for both`, sent.sheet.length >= 2, `${sent.sheet.length}`);
    check(`[${vp.n}] T28 no console errors`, errors.filter((e) => !/Failed to load resource/.test(e)).length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  // bar must not overlap hero CTA / footnotes / footer disclaimer on mobile
  {
    console.log("\n=== floating bar overlap (375) ===");
    const { page, ctx } = await newPage(browser, 375, 812);
    const probes = await page.evaluate(async () => {
      const hits = [];
      const cta = document.getElementById("persistent-cta");
      const targets = [".hero-composed__cta", "#sources-section", ".site-footer__legal", ".site-disclaimer"];
      for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
        if (cta.classList.contains("is-hidden")) continue;
        const cr = cta.getBoundingClientRect();
        for (const sel of targets) {
          document.querySelectorAll(sel).forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.height && !(r.bottom < cr.top || r.top > cr.bottom)) hits.push(`${sel}@${y}`);
          });
        }
      }
      return hits;
    });
    check("[375] T28 bar hides before it can cover hero CTA / footnotes / disclaimer", probes.length === 0, probes.slice(0, 4).join(", "));
    await ctx.close();
  }

  // ---------- reduced motion ----------
  {
    console.log("\n=== reduced motion ===");
    const { page, ctx } = await newPage(browser, 1440, 900, { reducedMotion: "reduce" });
    const rm = await page.evaluate(() => {
      const t = document.querySelector("[data-marquee-track]");
      return { cards: t.children.length, anim: getComputedStyle(t).animationName, animating: document.querySelector("[data-marquee]").classList.contains("is-animating") };
    });
    check("[reduced-motion] T25 marquee static, no duplicate set", rm.anim === "none" && !rm.animating && rm.cards === 7, JSON.stringify(rm));
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log("FAILED:\n - " + failed.map((f) => f.name).join("\n - "));
    process.exit(1);
  }
})();

