import { MAP_CATEGORIES, STATE_STATUSES, STATE_NAMES } from "./map-config.js";
import confetti from "./confetti.js";

const announcementBar = document.getElementById("announcement-bar");
if (announcementBar) {
  const closeBtn = announcementBar.querySelector("[data-dismiss-bar]");
  closeBtn?.addEventListener("click", () => {
    announcementBar.classList.add("is-dismissing");
    try {
      sessionStorage.setItem("rworld-announcement-dismissed", "1");
    } catch (e) {}
    announcementBar.addEventListener(
      "transitionend",
      () => {
        announcementBar.style.display = "none";
      },
      { once: true }
    );
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
  });
});

document.querySelectorAll("[data-video-thumb]").forEach((button) => {
  button.addEventListener("click", () => {
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("title", "Video coming soon");
  });
});

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxu3mwnTxu57bUPAMDQIQUrSecxFALut36hwXv3UvuY16wpr25j1p_etwoN4AaYvywgIg/exec";

async function submitLeadToGoogleSheet(payload) {
  const query = new URLSearchParams(payload).toString();
  const endpoint = `${GOOGLE_SCRIPT_URL}?${query}`;

  try {
    // Primary: POST request with payload in body and query string
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });
  } catch (postErr) {
    console.warn("POST attempt failed, trying fallback ping:", postErr);
    // Fallback: GET request (immune to most browser/localhost fetch restrictions)
    try {
      await fetch(endpoint, {
        method: "GET",
        mode: "no-cors",
      });
    } catch (getErr) {
      // Last-resort fallback: Image ping (never blocked by CORS or file://)
      const img = new Image();
      img.src = endpoint;
    }
  }
}

// Confetti burst originating from the submit button
function triggerCelebrationConfetti(button) {
  if (!button || typeof confetti !== "function") return;
  const rect = button.getBoundingClientRect();
  const originX = (rect.left + rect.width / 2) / window.innerWidth;
  const originY = (rect.top + rect.height / 2) / window.innerHeight;

  const brandColors = ["#01edff", "#ffd100", "#ff0099", "#2500ff", "#8a2be2", "#ffffff"];

  // 1. Upward eruption straight from the button
  confetti({
    origin: { x: originX, y: originY },
    particleCount: 55,
    angle: 90,
    spread: 65,
    startVelocity: 42,
    gravity: 0.9,
    ticks: 240,
    colors: brandColors,
    zIndex: 99999,
  });

  // 2. Dual angled side poppers
  setTimeout(() => {
    confetti({
      origin: { x: originX, y: originY },
      particleCount: 35,
      angle: 65,
      spread: 60,
      startVelocity: 46,
      gravity: 0.95,
      ticks: 250,
      colors: brandColors,
      zIndex: 99999,
    });
    confetti({
      origin: { x: originX, y: originY },
      particleCount: 35,
      angle: 115,
      spread: 60,
      startVelocity: 46,
      gravity: 0.95,
      ticks: 250,
      colors: brandColors,
      zIndex: 99999,
    });
  }, 90);

  // 3. Gentle lingering flutter
  setTimeout(() => {
    confetti({
      origin: { x: originX, y: originY },
      particleCount: 25,
      angle: 90,
      spread: 110,
      startVelocity: 26,
      gravity: 0.7,
      decay: 0.92,
      ticks: 300,
      colors: brandColors,
      zIndex: 99999,
    });
  }, 220);
}

// Main interest form (bottom)
const interestForm = document.getElementById("interest-form");
if (interestForm) {
  interestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!interestForm.reportValidity()) return;

    const submitBtn = interestForm.querySelector('button[type="submit"]');

    // Trigger celebration confetti immediately from the button
    triggerCelebrationConfetti(submitBtn);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const firstNameInput = interestForm.querySelector('[name="first_name"]');
    const lastNameInput = interestForm.querySelector('[name="last_name"]');
    const emailInput = interestForm.querySelector('[name="email"]');
    const phoneInput = interestForm.querySelector('[name="phone"]');
    const selectedRange = interestForm.querySelector('[name="investment_range"]:checked');

    const phoneVal = phoneInput ? phoneInput.value.trim() : "";
    const firstNameVal = firstNameInput ? firstNameInput.value.trim() : "";
    const lastNameVal = lastNameInput ? lastNameInput.value.trim() : "";
    const emailVal = emailInput ? emailInput.value.trim() : "";

    const payload = {
      first_name: firstNameVal,
      firstName: firstNameVal,
      last_name: lastNameVal,
      lastName: lastNameVal,
      email: emailVal,
      phone: phoneVal,
      phone_number: phoneVal,
      phoneNumber: phoneVal,
      investment_range: selectedRange ? selectedRange.value : "None selected",
      source: "Main Interest Form",
      timestamp: new Date().toLocaleString(),
    };

    // Transition to celebratory success state
    const successMessage = document.getElementById("interest-form-success");
    const promptHeading = document.getElementById("interest-card-prompt");
    if (promptHeading) promptHeading.hidden = true;
    interestForm.hidden = true;
    if (successMessage) {
      successMessage.hidden = false;
      successMessage.setAttribute("tabindex", "-1");
      successMessage.focus();
    }

    try {
      await submitLeadToGoogleSheet(payload);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  });
}

// Hero interest form (top capture)
const heroInterestForm = document.getElementById("hero-interest-form");
if (heroInterestForm) {
  heroInterestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!heroInterestForm.reportValidity()) return;

    const submitBtn = heroInterestForm.querySelector('button[type="submit"]');

    // Trigger celebration confetti immediately from the button
    triggerCelebrationConfetti(submitBtn);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const firstNameInput = heroInterestForm.querySelector('[name="first_name"]');
    const lastNameInput = heroInterestForm.querySelector('[name="last_name"]');
    const emailInput = heroInterestForm.querySelector('[name="email"]');
    const phoneInput = heroInterestForm.querySelector('[name="phone"]');

    const heroPhoneVal = phoneInput ? phoneInput.value.trim() : "";
    const heroFirstNameVal = firstNameInput ? firstNameInput.value.trim() : "";
    const heroLastNameVal = lastNameInput ? lastNameInput.value.trim() : "";
    const heroEmailVal = emailInput ? emailInput.value.trim() : "";

    const payload = {
      first_name: heroFirstNameVal,
      firstName: heroFirstNameVal,
      last_name: heroLastNameVal,
      lastName: heroLastNameVal,
      email: heroEmailVal,
      phone: heroPhoneVal,
      phone_number: heroPhoneVal,
      phoneNumber: heroPhoneVal,
      investment_range: "None selected",
      source: "Hero Interest Form",
      timestamp: new Date().toLocaleString(),
    };

    // Transition to celebratory success state
    const successMessage = document.getElementById("hero-interest-success");
    const heroPrompt = document.getElementById("hero-interest-prompt");
    if (heroPrompt) heroPrompt.hidden = true;
    heroInterestForm.hidden = true;
    if (successMessage) {
      successMessage.hidden = false;
      successMessage.setAttribute("tabindex", "-1");
      successMessage.focus();
    }

    try {
      await submitLeadToGoogleSheet(payload);
    } catch (err) {
      console.error("Hero submission failed:", err);
    }
  });
}

// Carousels (Leadership, Impact stripes & Operating System)
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const prevBtn = carousel.querySelector("[data-carousel-prev]");
  const nextBtn = carousel.querySelector("[data-carousel-next]");
  const dots = [...(carousel.parentElement.querySelectorAll("[data-carousel-dot]") || [])];
  const slides = [...track.children];

  function closestIndex() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll > 0 && track.scrollLeft >= maxScroll - 12) {
      return slides.length - 1;
    }
    const trackLeft = track.getBoundingClientRect().left;
    let closest = 0;
    let closestDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.getBoundingClientRect().left - trackLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function scrollToIndex(i) {
    const slide = slides[Math.max(0, Math.min(slides.length - 1, i))];
    if (slide) slide.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function updateUI() {
    const idx = closestIndex();
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 4;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll - 4;
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === idx));
  }

  if (prevBtn) prevBtn.addEventListener("click", () => scrollToIndex(closestIndex() - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollToIndex(closestIndex() + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => scrollToIndex(i)));

  let ticking = false;
  track.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateUI();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", updateUI);
  updateUI();
});

// US Reuse Legislation Map Component
function initReuseMap() {
  const mapSvg = document.querySelector(".reuse-map-svg");
  const legendContainer = document.getElementById("reuse-map-legend");
  if (!mapSvg) return;

  const stateElements = mapSvg.querySelectorAll("[data-state]");

  // Color each state based on STATE_STATUSES and MAP_CATEGORIES
  stateElements.forEach((el) => {
    const code = el.getAttribute("data-state")?.toLowerCase();
    const status = STATE_STATUSES[code] || "other";
    el.classList.add(`status-${status}`);
    const cat = MAP_CATEGORIES.find((c) => c.id === status);
    if (cat) {
      el.setAttribute("fill", cat.color);
    }
  });

  // Render dynamic legend
  if (legendContainer) {
    legendContainer.innerHTML = MAP_CATEGORIES.map((cat) => `
      <div class="reuse-legend-item" data-category="${cat.id}" title="${cat.description}">
        <span class="reuse-legend-swatch" style="background-color: ${cat.color};"></span>
        <span class="reuse-legend-label"><strong>${cat.label}</strong></span>
      </div>
    `).join("");

    // Interactive highlight on legend hover
    legendContainer.querySelectorAll(".reuse-legend-item").forEach((item) => {
      const catId = item.getAttribute("data-category");
      item.addEventListener("mouseenter", () => {
        stateElements.forEach((el) => {
          const code = el.getAttribute("data-state")?.toLowerCase();
          const stateCat = STATE_STATUSES[code] || "other";
          el.style.opacity = stateCat === catId ? "1" : "0.35";
        });
      });
      item.addEventListener("mouseleave", () => {
        stateElements.forEach((el) => {
          el.style.opacity = "1";
        });
      });
    });
  }

  // Floating hover tooltip
  let tooltip = document.querySelector(".reuse-map__tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "reuse-map__tooltip";
    document.body.appendChild(tooltip);
  }

  stateElements.forEach((el) => {
    const code = el.getAttribute("data-state")?.toLowerCase();
    const stateName = STATE_NAMES[code] || code.toUpperCase();
    const statusId = STATE_STATUSES[code] || "other";
    const category = MAP_CATEGORIES.find((c) => c.id === statusId);
    const statusText = category ? category.label.replace(/\s*\(\d+\s*states\)/i, "") : "Other";

    el.addEventListener("mouseenter", () => {
      tooltip.textContent = `${stateName}: ${statusText}`;
      tooltip.style.opacity = "1";
    });

    el.addEventListener("mousemove", (e) => {
      tooltip.style.left = `${e.pageX}px`;
      tooltip.style.top = `${e.pageY}px`;
    });

    el.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initReuseMap();
    initPersistentCta();
  });
} else {
  initReuseMap();
  initPersistentCta();
}

// Persistent / Sticky CTA Bar
function initPersistentCta() {
  const persistentCta = document.getElementById("persistent-cta");
  if (!persistentCta) return;

  const heroSection = document.querySelector(".hero");
  const bottomFormSection = document.getElementById("interested-form");
  const footerSection = document.querySelector(".site-footer");

  function updateVisibility() {
    const scrollY = window.scrollY || window.pageYOffset;
    let inHero = false;
    let inBottom = false;

    if (heroSection) {
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom > 150) inHero = true;
    }
    if (bottomFormSection) {
      const rect = bottomFormSection.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) inBottom = true;
    }
    if (footerSection) {
      const rect = footerSection.getBoundingClientRect();
      if (rect.top < window.innerHeight) inBottom = true;
    }

    const shouldShow = scrollY > 250 && !inHero && !inBottom;
    persistentCta.classList.toggle("is-hidden", !shouldShow);
  }

  window.addEventListener("scroll", updateVisibility, { passive: true });
  window.addEventListener("resize", updateVisibility, { passive: true });
  updateVisibility();

  const persistentBtn = persistentCta.querySelector(".persistent-cta__btn");
  persistentBtn?.addEventListener("click", () => {
    const firstInput = document.getElementById("interest-first-name");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 600);
    }
  });
}
