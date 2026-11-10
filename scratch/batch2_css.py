p = "css/ttw-v2.css"
s = open(p, encoding="utf-8").read()

def rep(old, new):
    global s
    assert old in s, old[:60]
    s = s.replace(old, new, 1)

# ---- T25: seamless marquee ----
rep('''  padding: 0 var(--section-pad-x);
  display: flex;
  gap: 20px;
  width: max-content;
  will-change: transform;
}

.celeb-card {
  flex: 0 0 clamp(260px, 24vw, 360px);
}''', '''  padding: 0;
  display: flex;
  gap: 0;
  width: max-content;
  will-change: transform;
}

/* Static (reduced-motion / no-JS) strip keeps its side padding; the animated loop must have none so
   half of the track equals exactly one set. */
.marquee:not(.is-animating) .marquee__track {
  padding-inline: var(--section-pad-x);
}

.celeb-card {
  flex: 0 0 clamp(260px, 24vw, 360px);
  /* trailing gap lives on the card so the duplicate set repeats with identical spacing at the seam */
  margin-right: 20px;
}''')
rep('animation: marquee-scroll 42s linear infinite;', 'animation: marquee-scroll var(--marquee-duration, 42s) linear infinite;')

# ---- T30: press logos, no clickable-looking card ----
rep('''  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.press-logo__card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.16);
}
''', '''  /* Not a link: no box, border, shadow, hover or pointer treatment. */
  background: none;
  border: 0;
  box-shadow: none;
  cursor: default;
}
''')

# ---- T32: four equal boxes ----
rep('''  grid-template-columns: repeat(2, 1fr);
  gap: clamp(20px, 3vw, 32px);
}

.proceeds-card {
  gap: 16px;
}

.proceeds-card .h3 {
  font-size: clamp(22px, 2.2vw, 30px);
}''', '''  grid-template-columns: repeat(4, 1fr);
  gap: clamp(16px, 2vw, 28px);
}

.proceeds-card {
  gap: 16px;
  padding: clamp(22px, 2vw, 32px);
}

.proceeds-card .h3 {
  font-size: clamp(20px, 1.7vw, 24px);
  text-wrap: balance;
}''')
rep('''.proceeds-card--wide {
  grid-column: 1 / -1;
}

''', '')
rep('''@media (max-width: 720px) {
  .proceeds-cards {
    grid-template-columns: 1fr;
  }
  .proceeds-card--wide {
    grid-column: auto;
  }
}''', '''@media (max-width: 1100px) {
  .proceeds-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .proceeds-cards {
    grid-template-columns: 1fr;
  }
}''')

# ---- T29: loop-centre mark becomes the r.World logo lockup (148:113) ----
rep('''.reuse-loop__mark {
  position: absolute;
  width: clamp(70px, 12vw, 110px);
  aspect-ratio: 1;
  opacity: 0.9;
  pointer-events: none;
}''', '''.reuse-loop__mark {
  position: absolute;
  width: clamp(104px, 14vw, 150px);
  aspect-ratio: 148 / 113;
  height: auto;
  pointer-events: none;
}''')
rep('''  .reuse-loop__mark {
    width: 44px;
  }''', '''  .reuse-loop__mark {
    width: 96px;
  }''')

# ---- T22/T23: long lead stat wraps; hero footnote ref ----
s += '''
/* ==========================================================================
   Batch 2: hero lead stat + combined hero footnote, floating form
   ========================================================================== */
/* "30M single-use cups eliminated." is much longer than the other stats: let it wrap and balance. */
.hero-pre-reel .hero-v2__stat-text {
  white-space: normal;
  text-wrap: balance;
  max-width: min(100%, 16em);
  margin-inline: auto;
}

/* One tiny, muted footnote mark after "10,000+ LIVE EVENTS". Sits on a faint dark chip so it keeps
   >= 4.5:1 contrast over the (yellow-tinted) video. */
.hero-pre-reel .hero-fn {
  display: inline-block;
  vertical-align: super;
  line-height: 1;
  margin-left: 0.12em;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-shadow: none;
  white-space: nowrap;
}

.hero-pre-reel .hero-fn a {
  position: relative;
  display: inline-block;
  padding: 2px 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.62);
  color: #e6e6e6;
  text-decoration: none;
  pointer-events: auto;
}

.hero-pre-reel .hero-fn a::before {
  content: "";
  position: absolute;
  inset: -10px;
}

.hero-pre-reel .hero-fn a:hover,
.hero-pre-reel .hero-fn a:focus-visible {
  color: #ffffff;
  text-decoration: underline;
}

.hero-pre-reel .hero-fn a:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

/* Floating notification-list form (native <dialog>) */
.float-dialog {
  border: 0;
  padding: 0;
  background: transparent;
  width: min(92vw, 640px);
  max-width: 640px;
  max-height: 92vh;
  max-height: 92dvh;
  overflow: visible;
  color: var(--black);
}

.float-dialog::backdrop {
  background: rgba(10, 10, 12, 0.62);
}

.float-dialog__panel {
  position: relative;
  background: #ffffff;
  border-radius: 28px;
  padding: clamp(28px, 4vw, 44px);
  max-height: 92vh;
  max-height: 92dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
}

.float-dialog__title {
  margin: 0;
  padding-inline: 28px;
  text-align: center;
}

.float-dialog__close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: #eef0f2;
  color: #1a202c;
  cursor: pointer;
}

.float-dialog__close:hover {
  background: #dfe2e6;
}

.float-dialog__close:focus-visible {
  outline: 3px solid var(--purple, #8a2be2);
  outline-offset: 2px;
}

.float-dialog .cta-form__success[hidden],
.float-dialog [hidden] {
  display: none;
}

@media (max-width: 640px) {
  .float-dialog {
    width: 100vw;
    max-width: 100vw;
    margin: auto 0 0;
  }
  .float-dialog__panel {
    border-radius: 24px 24px 0 0;
    padding-bottom: max(28px, env(safe-area-inset-bottom));
  }
}

@media (prefers-reduced-motion: no-preference) {
  .float-dialog[open] .float-dialog__panel {
    animation: float-dialog-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes float-dialog-in {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
}
'''
open(p, "w", encoding="utf-8").write(s)

# loop mark html
p = "index.html"
h = open(p, encoding="utf-8").read()
old = '<img class="reuse-loop__mark" src="public/assets/rworld-mark.svg" alt="" aria-hidden="true" />'
new = '<img class="reuse-loop__mark" src="public/assets/ttw/rworld-logo.svg" alt="r.World" width="148" height="113" />'
assert old in h
h = h.replace(old, new, 1)
open(p, "w", encoding="utf-8").write(h)
print("ok")
