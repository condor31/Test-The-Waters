/**
 * TTW v2 Redesign Interactive Enhancements
 * - Reusable Placeholder component asset swapper
 * - Marquee auto-scroll with pause on hover/focus & keyboard controls
 * - Hero stat looping cycle
 * - Brand anthem in-view video player facade
 * - Motion toggle buttons (WCAG 2.2 AA compliant, prefers-reduced-motion aware)
 */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initAnnouncementOffset();
  initPlaceholders();
  initMarquee(prefersReducedMotion);
  initHeroStats(prefersReducedMotion);
  initBrandAnthem();
  initMotionToggles();
  initStatBand(prefersReducedMotion);
});

/**
 * Stat Band (Why It Matters) in-view animation
 */
function initStatBand(prefersReducedMotion) {
  if (prefersReducedMotion) return;
  const statBand = document.querySelector(".impact-stripes--four");
  if (!statBand) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statBand.classList.add("is-in-view");
          observer.unobserve(statBand);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(statBand);
}

/**
 * 1. Placeholders: Displays labeled neutral placeholder box with target path.
 * If a real <img> is nested or if window.__SWAP_ASSET__(src, targetPath) is called,
 * it replaces the placeholder with the real asset.
 */
function initPlaceholders() {
  // Support hot swapping or dropped assets without throwing network 404s in console
  window.swapPlaceholderAsset = (selectorOrSlot, imageSrc, altText = "") => {
    const el = document.querySelector(selectorOrSlot);
    if (!el) return;
    el.innerHTML = "";
    el.removeAttribute("aria-hidden");
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = altText;
    img.loading = "lazy";
    el.appendChild(img);
    el.classList.add("has-image");
  };
}

/**
 * 2. Celebrities Marquee: duplicates track for smooth continuous infinite CSS marquee.
 */
function initMarquee(prefersReducedMotion) {
  const marquee = document.querySelector("[data-marquee]");
  if (!marquee) return;

  const track = marquee.querySelector("[data-marquee-track]");
  if (!track) return;

  // Keyboard navigation for marquee
  marquee.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      marquee.scrollBy({ left: -260, behavior: "smooth" });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      marquee.scrollBy({ left: 260, behavior: "smooth" });
    }
  });

  // Reduced motion: static, manually scrollable strip. No duplicate set, nothing moves.
  if (prefersReducedMotion) return;

  marquee.scrollLeft = 0;

  // Seamless loop: a second copy of the set sits in the same track. Every card carries its own
  // trailing gap (margin, not flex gap/padding), so one set is exactly half of the track and
  // translate3d(-50%, 0, 0) lands precisely on the start of the duplicate.
  const originalCards = [...track.children];
  const n = originalCards.length;
  if (!n) return;

  originalCards.forEach((card) => {
    card.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      img.decoding = "async";
    });
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      img.decoding = "async";
      img.alt = "";
    });
    clone.querySelectorAll("a, button, [tabindex]").forEach((el) => el.setAttribute("tabindex", "-1"));
    track.appendChild(clone);
  });

  // Enable animation state first so track padding is stripped consistently before measuring
  marquee.classList.add("is-animating");

  // Constant speed (px/second) at every breakpoint: duration follows the measured loop distance.
  const SPEED_PX_PER_SEC = 60;
  const syncLoop = () => {
    const cards = track.children;
    if (cards.length < n * 2) return;

    // Reset card width override to read the responsive flex measurement, then round to integer pixels
    // to prevent fractional subpixel rounding mismatch at the loop seam
    marquee.style.removeProperty("--celeb-card-width");
    const rawCardWidth = cards[0].getBoundingClientRect().width;
    const cardWidth = Math.round(rawCardWidth);
    marquee.style.setProperty("--celeb-card-width", `${cardWidth}px`);

    // Measure exact integer distance between original set and clone set
    const a = cards[0].getBoundingClientRect().left;
    const b = cards[n].getBoundingClientRect().left;
    const distance = Math.round(Math.abs(b - a));
    if (!distance) return;

    marquee.scrollLeft = 0;
    marquee.style.setProperty("--marquee-distance", `-${distance}px`);
    marquee.style.setProperty("--marquee-duration", `${(distance / SPEED_PX_PER_SEC).toFixed(2)}s`);
  };

  syncLoop();

  // Debounced resize handler so window changes don't cause animation timeline jitter
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      requestAnimationFrame(syncLoop);
    }, 100);
  }, { passive: true });
}

/**
 * 3. Hero Stats: Split-text character-staggered kinetic typography loop (Motion.dev style)
 */
function initHeroStats(prefersReducedMotion) {
  const statItems = Array.from(document.querySelectorAll(".hero-pre-reel .hero-v2__stat"));
  if (!statItems.length) return;

  // Split each stat line into words and characters with staggered CSS indices
  statItems.forEach((item) => {
    const textEl = item.querySelector(".hero-v2__stat-text");
    if (!textEl) return;

    // Keep an optional footnote reference (sup.hero-fn) intact: it is not split or animated per character.
    const fnRef = textEl.querySelector(".hero-fn");
    if (fnRef) fnRef.remove();
    const rawText = textEl.textContent.trim();
    item.setAttribute("aria-label", rawText);
    textEl.innerHTML = "";

    const words = rawText.split(" ");
    let globalCharIndex = 0;

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "split-word";
      wordSpan.setAttribute("aria-hidden", "true");

      for (let i = 0; i < word.length; i++) {
        const charSpan = document.createElement("span");
        charSpan.className = "split-char";
        charSpan.textContent = word[i];
        charSpan.style.setProperty("--char-index", globalCharIndex);
        wordSpan.appendChild(charSpan);
        globalCharIndex++;
      }
      textEl.appendChild(wordSpan);

      if (wordIndex < words.length - 1) {
        const spaceSpan = document.createElement("span");
        spaceSpan.className = "split-space";
        spaceSpan.innerHTML = "&nbsp;";
        spaceSpan.setAttribute("aria-hidden", "true");
        textEl.appendChild(spaceSpan);
        globalCharIndex++;
      }
    });

    if (fnRef) textEl.appendChild(fnRef);
  });

  let currentIndex = 0;

  // Initialize: first item active, others reset
  statItems.forEach((stat, idx) => {
    stat.classList.remove("is-highlighted", "is-leaving");
    if (idx === 0) {
      stat.classList.add("is-active");
    } else {
      stat.classList.remove("is-active");
    }
  });

  if (prefersReducedMotion) return;

  const HOLD_DURATION = 3200; // Duration each line remains featured
  const EXIT_CLEANUP = 800;   // Cleanup after exit animation completes

  setInterval(() => {
    const currentStat = statItems[currentIndex];
    const nextIndex = (currentIndex + 1) % statItems.length;
    const nextStat = statItems[nextIndex];

    // Current line ripples upward and fades out
    currentStat.classList.remove("is-active");
    currentStat.classList.add("is-leaving");

    // Next line ripples in from below with staggered characters
    nextStat.classList.remove("is-leaving");
    void nextStat.offsetWidth; // force reflow for smooth start
    nextStat.classList.add("is-active");

    // Clean up leaving state after transition completes
    setTimeout(() => {
      currentStat.classList.remove("is-leaving");
    }, EXIT_CLEANUP);

    currentIndex = nextIndex;
  }, HOLD_DURATION);
}

/**
 * Sync dynamic announcement bar height with CSS custom property
 */
function initAnnouncementOffset() {
  const bar = document.getElementById("announcement-bar");
  function syncHeight() {
    if (bar && bar.offsetHeight > 0 && getComputedStyle(bar).display !== "none") {
      document.documentElement.style.setProperty("--announcement-bar-height", `${bar.offsetHeight}px`);
    } else {
      document.documentElement.style.setProperty("--announcement-bar-height", "0px");
    }
  }

  syncHeight();
  window.addEventListener("resize", syncHeight, { passive: true });

  const closeBtn = bar?.querySelector("[data-dismiss-bar]");
  closeBtn?.addEventListener("click", () => {
    setTimeout(syncHeight, 200);
  });
}

/**
 * 4. Brand Anthem: in-view muted autoplay facade or user click.
 */
function initBrandAnthem() {
  const player = document.getElementById("brand-anthem-player");
  if (!player) return;

  const facade = player.querySelector(".brand-anthem__facade");
  const iframeSlot = player.querySelector(".brand-anthem__iframe-slot");
  const videoId = player.dataset.videoId || "yAKUKKdTXBw";
  let hasLoaded = false;

  function loadIframe(autoplayMuted = false) {
    if (hasLoaded) return;
    hasLoaded = true;
    const autoParam = autoplayMuted ? "&autoplay=1&mute=1" : "&autoplay=1";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1${autoParam}`;
    iframe.title = "r.World Brand Anthem";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.onload = () => {
      facade.style.display = "none";
    };
    iframeSlot.appendChild(iframe);
  }

  facade?.addEventListener("click", () => {
    loadIframe(false);
  });

  // IntersectionObserver to trigger muted autoplay when scrolled into view
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            // Check if user hasn't explicitly disabled autoplay / motion
            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (!reduceMotion) {
              loadIframe(true);
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(player);
  }
}

/**
 * 5. Motion Toggles: Controls for auto-motion (Celebrities, Reuse Loop).
 */
function initMotionToggles() {
  const toggles = document.querySelectorAll("[data-motion-toggle]");
  toggles.forEach((btn) => {
    const targetName = btn.getAttribute("data-motion-toggle");
    const pauseLabel = btn.getAttribute("data-label-pause") || "Pause animation";
    const playLabel = btn.getAttribute("data-label-play") || "Play animation";

    btn.addEventListener("click", () => {
      const isPaused = btn.getAttribute("aria-pressed") === "true";
      const nextPaused = !isPaused;

      btn.setAttribute("aria-pressed", nextPaused ? "true" : "false");
      btn.setAttribute("aria-label", nextPaused ? playLabel : pauseLabel);

      if (targetName === "celebrities") {
        const marquee = document.querySelector("[data-marquee]");
        marquee?.classList.toggle("is-paused", nextPaused);
      } else if (targetName === "reuse-loop") {
        const highlight = document.querySelector(".reuse-loop__highlight");
        if (highlight) {
          highlight.style.animationPlayState = nextPaused ? "paused" : "running";
        }
      }
    });
  });
}
