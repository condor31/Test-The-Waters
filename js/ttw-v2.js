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

  initPlaceholders();
  initMarquee(prefersReducedMotion);
  initHeroStats(prefersReducedMotion);
  initBrandAnthem();
  initMotionToggles();
});

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

  // Clone track items for seamless loop if not reduced motion
  const originalCards = [...track.children];
  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  if (!prefersReducedMotion) {
    marquee.classList.add("is-animating");
  }

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
}

/**
 * 3. Hero Stats: loops subtle highlight through the 4 stats every 3 seconds.
 */
function initHeroStats(prefersReducedMotion) {
  const stats = document.querySelectorAll(".hero-v2__stat");
  if (!stats.length || prefersReducedMotion) return;

  let currentIndex = 0;
  stats[0].classList.add("is-highlighted");

  setInterval(() => {
    stats[currentIndex].classList.remove("is-highlighted");
    currentIndex = (currentIndex + 1) % stats.length;
    stats[currentIndex].classList.add("is-highlighted");
  }, 3000);
}

/**
 * 4. Brand Anthem: in-view muted autoplay facade or user click.
 */
function initBrandAnthem() {
  const player = document.getElementById("brand-anthem-player");
  if (!player) return;

  const facade = player.querySelector(".brand-anthem__facade");
  const iframeSlot = player.querySelector(".brand-anthem__iframe-slot");
  const videoId = player.dataset.videoId || "TXxys99LGoM";
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
