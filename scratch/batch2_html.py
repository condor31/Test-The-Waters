import re, io
p = "index.html"
s = open(p, encoding="utf-8").read()

# ---------- T23 step 1: renumber existing footnotes n -> n+1 (new hero footnote becomes #1) ----------
def bump(m): return m.group(1) + str(int(m.group(2)) + 1) + m.group(3)
s = re.sub(r'(href="#fn)(\d+)(")', bump, s)
s = re.sub(r'(id="fn)(\d+)(")', bump, s)
s = re.sub(r'(href="#fnref)(\d+)(")', bump, s)
s = re.sub(r'(id="fnref)(\d+)(["-])', bump, s)
s = re.sub(r'(aria-label="Jump back to reference )(\d+)(")', bump, s)
# visible numbers inside <sup ...><a href="#fnN" ...>N</a></sup>
s = re.sub(r'(<sup class="(?:footnote-ref|fn-ref)"[^>]*><a href="#fn\d+" id="fnref\d+(?:-leader)?">)(\d+)(</a></sup>)', bump, s)

# ---------- T23 step 2: hero footnote entry (old TTW fn 8, 9, 14, 15, verbatim) ----------
fn1 = ('      <li id="fn1"><a href="#fnref1" class="fn-backref" aria-label="Jump back to reference 1">&uarr;</a> '
       'Reusable items delivered to customers, Sep 2017&ndash;Oct 2026; each assumed to displace one single-use item. Source: r.World internal operational data (r.Turn platform, customer invoices and delivery/pickup records).<br>\n'
       '        Cities with at least one r.World customer site, Sep 2017&ndash;Oct 2026. Source: customer invoices and r.Turn log of customer site addresses.<br>\n'
       '        States with at least one r.World customer site, Sep 2017&ndash;Oct 2026. Source: customer invoices and r.Turn log of customer site addresses.<br>\n'
       '        Events served Sep 2017&ndash;Oct 2026, counted from customer pickups. Source: r.World internal operational data (r.Turn platform, customer invoices and delivery/pickup records).</li>\n')
anchor = '      <li id="fn2"><a href="#fnref2"'
assert anchor in s
s = s.replace(anchor, fn1 + anchor, 1)

# ---------- T22: lead stat copy + T23: single hero ref after the 10,000+ stat ----------
old = '<li class="hero-v2__stat is-active"><span class="hero-v2__stat-text">30M DRINKS SERVED</span></li>'
new = '<li class="hero-v2__stat is-active"><span class="hero-v2__stat-text">30M single-use cups eliminated.</span></li>'
assert old in s; s = s.replace(old, new, 1)
old = '<li class="hero-v2__stat"><span class="hero-v2__stat-text">10,000+ LIVE EVENTS</span></li>'
new = ('<li class="hero-v2__stat"><span class="hero-v2__stat-text">10,000+ LIVE EVENTS<sup class="hero-fn"><a href="#fn1" id="fnref1" aria-label="Footnote 1: sources for the figures in this section">1</a></sup></span></li>')
assert old in s; s = s.replace(old, new, 1)

# ---------- T24: VID-01 comment ----------
old = '      <div class="brand-anthem__player hero-composed__player" id="brand-anthem-player"'
new = '      <!-- ASSET-TODO: VID-01 | swap to V5 YouTube URL when published -->\n' + old
assert old in s; s = s.replace(old, new, 1)

# ---------- T27: swap Crypto.com Arena and LA Memorial Coliseum cards (DOM order) ----------
lis = re.findall(r'      <li class="venue-card">.*?</li>\n', s, flags=re.S)
assert len(lis) == 6, len(lis)
crypto = next(l for l in lis if 'Crypto.com Arena</h3>' in l)
cole = next(l for l in lis if 'LA Memorial Coliseum</h3>' in l)
s = s.replace(crypto, '@@C@@', 1).replace(cole, '@@L@@', 1)
s = s.replace('@@C@@', cole, 1).replace('@@L@@', crypto, 1)

# ---------- T37 / C11 ----------
old = 'From courtside to front-row center, r.World&rsquo;s reusable r.Cups are in the hands of some of your favorite celebrities.'
new = 'From courtside to front-row center, r.World’s reusable r.Cups, plates and other foodware are in the hands of some of your favorite celebrities.'
assert old in s; s = s.replace(old, new, 1)

# ---------- T32 / C05-C09: four boxes ----------
old = '<p class="module-head__sub">Two priorities to make reuse mainstream nationwide.</p>'
new = '<p class="module-head__sub">Four ways your investment makes reuse mainstream nationwide.</p>'
assert old in s; s = s.replace(old, new, 1)
old = 'so fewer touches is what lets reuse compete with single-use on price.'
new = 'so fewer touches is what lets r.World compete with single-use on price.'
assert old in s; s = s.replace(old, new, 1)
start = s.index('        <li class="info-card proceeds-card proceeds-card--wide">')
end = s.index('      </ul>', start)
boxes = ('        <li class="info-card proceeds-card">\n'
         '          <h3 class="h3">Legislation Is Here, and More Is Coming</h3>\n'
         '          <p>Extended Producer Responsibility rules are landing, beginning in California. More policy is on the way that will help reuse scale.</p>\n'
         '        </li>\n'
         '        <li class="info-card proceeds-card">\n'
         '          <h3 class="h3">Reuse Expands Into Consumer Packaged Goods</h3>\n'
         '          <p>Reuse could extend to categories that don’t have it yet, starting with consumer packaged goods.</p>\n'
         '        </li>\n')
s = s[:start] + boxes + s[end:]
s = s.replace('<!-- TODO(connor): Layout follows the wireframe (2 cards + 1 full-width card). Figma\'s three-card treatment couldn\'t be read this pass. -->\n      <ul class="proceeds-cards">',
              '<ul class="proceeds-cards">', 1)

open(p, "w", encoding="utf-8").write(s)
print("ok")
