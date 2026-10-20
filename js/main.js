import { MAP_CATEGORIES, STATE_STATUSES, STATE_NAMES } from "./map-config.js?v=20261015_03";
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

const MAILCHIMP_URL =
  "https://rworldreuse.us15.list-manage.com/subscribe/post-json?u=d16d76c3bd0a764ea148af923&id=23a13695bf&f_id=00ad9fe1f0";
const MAILCHIMP_POST_ACTION =
  "https://rworldreuse.us15.list-manage.com/subscribe/post?u=d16d76c3bd0a764ea148af923&id=23a13695bf&f_id=00ad9fe1f0";

function submitLeadToMailchimp(params) {
  return new Promise((resolve, reject) => {
    const callbackName = "mc_cb_" + Math.random().toString(36).substring(2, 10);
    const query = new URLSearchParams(params);
    query.set("c", callbackName);

    const script = document.createElement("script");
    script.src = `${MAILCHIMP_URL}&${query.toString()}`;

    let resolved = false;

    const cleanup = () => {
      clearTimeout(timer);
      try {
        delete window[callbackName];
      } catch (e) {
        window[callbackName] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error("Mailchimp request timed out"));
      }
    }, 4500);

    window[callbackName] = (response) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(response);
      }
    };

    script.onerror = (err) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(err || new Error("Mailchimp request failed"));
      }
    };

    document.head.appendChild(script);
  });
}

function formatMailchimpError(rawMsg) {
  if (!rawMsg) return "An error occurred. Please check your information and try again.";
  let clean = rawMsg.replace(/^\d+\s*[-:]*\s*/, "");
  clean = clean.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
  return clean;
}

function submitViaHiddenIframe(params) {
  let iframe = document.getElementById("mc-hidden-iframe");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = "mc-hidden-iframe";
    iframe.id = "mc-hidden-iframe";
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);
  }

  // Create an off-screen form with exact payload to ensure delivery even if visible form is hidden
  const hiddenForm = document.createElement("form");
  hiddenForm.method = "POST";
  hiddenForm.action = MAILCHIMP_POST_ACTION;
  hiddenForm.target = "mc-hidden-iframe";
  hiddenForm.style.display = "none";

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      hiddenForm.appendChild(input);
    }
  });

  document.body.appendChild(hiddenForm);
  try {
    HTMLFormElement.prototype.submit.call(hiddenForm);
  } catch (e) {
    hiddenForm.submit();
  }

  setTimeout(() => {
    if (hiddenForm.parentNode) {
      hiddenForm.parentNode.removeChild(hiddenForm);
    }
  }, 3000);
}

function addPhoneParams(params, phoneVal, form = null) {
  if (!phoneVal) return;
  params.MMERGE4 = phoneVal;
  let digits = phoneVal.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.substring(1);
  }
  if (digits.length === 10) {
    const area = digits.substring(0, 3);
    const detail1 = digits.substring(3, 6);
    const detail2 = digits.substring(6, 10);
    params["MMERGE4[area]"] = area;
    params["MMERGE4[detail1]"] = detail1;
    params["MMERGE4[detail2]"] = detail2;

    if (form) {
      const areaInput = form.querySelector('[name="MMERGE4[area]"]');
      const d1Input = form.querySelector('[name="MMERGE4[detail1]"]');
      const d2Input = form.querySelector('[name="MMERGE4[detail2]"]');
      if (areaInput) areaInput.value = area;
      if (d1Input) d1Input.value = detail1;
      if (d2Input) d2Input.value = detail2;
    }
  }
}

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
    const originalBtnText = submitBtn ? submitBtn.textContent : "Alert Me When The Opportunity Opens";
    const errorEl = document.getElementById("interest-form-error");

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const firstNameInput = interestForm.querySelector('[name="FNAME"]');
    const lastNameInput = interestForm.querySelector('[name="LNAME"]');
    const emailInput = interestForm.querySelector('[name="EMAIL"]');
    const phoneInput =
      interestForm.querySelector('[name="MMERGE4"]') ||
      interestForm.querySelector('[name="COMPANY"]');
    const selectedRange =
      interestForm.querySelector('[name="MMERGE5"]:checked') ||
      interestForm.querySelector('[name="investment_range"]:checked');
    const honeypotInput = interestForm.querySelector('[name="b_d16d76c3bd0a764ea148af923_23a13695bf"]');

    const firstNameVal = firstNameInput ? firstNameInput.value.trim() : "";
    const lastNameVal = lastNameInput ? lastNameInput.value.trim() : "";
    const emailVal = emailInput ? emailInput.value.trim() : "";
    const phoneVal = phoneInput ? phoneInput.value.trim() : "";
    const honeypotVal = honeypotInput ? honeypotInput.value.trim() : "";
    const rangeVal = selectedRange ? selectedRange.value : "";

    const mailchimpParams = {
      EMAIL: emailVal,
      FNAME: firstNameVal,
      LNAME: lastNameVal,
      tags: "1743734",
      b_d16d76c3bd0a764ea148af923_23a13695bf: honeypotVal,
    };

    addPhoneParams(mailchimpParams, phoneVal, interestForm);

    if (rangeVal) {
      mailchimpParams.MMERGE5 = rangeVal;
    }

    const googlePayload = {
      first_name: firstNameVal,
      firstName: firstNameVal,
      last_name: lastNameVal,
      lastName: lastNameVal,
      email: emailVal,
      phone: phoneVal,
      phone_number: phoneVal,
      phoneNumber: phoneVal,
      investment_range: rangeVal || "None selected",
      source: "Main Interest Form (Mailchimp)",
      timestamp: new Date().toLocaleString(),
    };

    try {
      console.log("[Mailchimp] Submitting Bottom Form payload:", mailchimpParams);
      const response = await submitLeadToMailchimp(mailchimpParams);
      console.log("[Mailchimp] Bottom Form Response:", response);
      window.__lastBottomResponse = response;

      if (response && response.result === "error") {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
        if (errorEl) {
          errorEl.textContent = formatMailchimpError(response.msg);
          errorEl.hidden = false;
          errorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        return;
      }
    } catch (err) {
      console.warn("[Mailchimp] JSONP blocked or failed, falling back to iframe POST:", err);
      submitViaHiddenIframe(mailchimpParams);
    }

    // Success transition & celebration confetti
    triggerCelebrationConfetti(submitBtn);

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
      submitLeadToGoogleSheet(googlePayload);
    } catch (err) {
      console.error("Backup Google Sheet submission failed:", err);
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
    const originalBtnText = submitBtn ? submitBtn.textContent : "Join the Notification List";
    const errorEl = document.getElementById("hero-form-error");

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const firstNameInput = heroInterestForm.querySelector('[name="FNAME"]');
    const lastNameInput = heroInterestForm.querySelector('[name="LNAME"]');
    const emailInput = heroInterestForm.querySelector('[name="EMAIL"]');
    const phoneInput =
      heroInterestForm.querySelector('[name="MMERGE4"]') ||
      heroInterestForm.querySelector('[name="COMPANY"]');
    const honeypotInput = heroInterestForm.querySelector('[name="b_d16d76c3bd0a764ea148af923_23a13695bf"]');

    const heroFirstNameVal = firstNameInput ? firstNameInput.value.trim() : "";
    const heroLastNameVal = lastNameInput ? lastNameInput.value.trim() : "";
    const heroEmailVal = emailInput ? emailInput.value.trim() : "";
    const heroPhoneVal = phoneInput ? phoneInput.value.trim() : "";
    const honeypotVal = honeypotInput ? honeypotInput.value.trim() : "";

    const mailchimpParams = {
      EMAIL: heroEmailVal,
      FNAME: heroFirstNameVal,
      LNAME: heroLastNameVal,
      tags: "1743734",
      b_d16d76c3bd0a764ea148af923_23a13695bf: honeypotVal,
    };

    addPhoneParams(mailchimpParams, heroPhoneVal, heroInterestForm);

    const googlePayload = {
      first_name: heroFirstNameVal,
      firstName: heroFirstNameVal,
      last_name: heroLastNameVal,
      lastName: heroLastNameVal,
      email: heroEmailVal,
      phone: heroPhoneVal,
      phone_number: heroPhoneVal,
      phoneNumber: heroPhoneVal,
      investment_range: "None selected",
      source: "Hero Interest Form (Mailchimp)",
      timestamp: new Date().toLocaleString(),
    };

    try {
      console.log("[Mailchimp] Submitting Hero Form payload:", mailchimpParams);
      const response = await submitLeadToMailchimp(mailchimpParams);
      console.log("[Mailchimp] Hero Form Response:", response);
      window.__lastHeroResponse = response;

      if (response && response.result === "error") {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
        if (errorEl) {
          errorEl.textContent = formatMailchimpError(response.msg);
          errorEl.hidden = false;
          errorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        return;
      }
    } catch (err) {
      console.warn("[Mailchimp] JSONP blocked or failed, falling back to iframe POST:", err);
      submitViaHiddenIframe(mailchimpParams);
    }

    // Success transition & celebration confetti
    triggerCelebrationConfetti(submitBtn);

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
      submitLeadToGoogleSheet(googlePayload);
    } catch (err) {
      console.error("Backup Google Sheet submission failed:", err);
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
      <div class="reuse-legend-item reuse-legend-item--${cat.id}" data-category="${cat.id}" title="${cat.description}">
        <span class="reuse-legend-swatch reuse-legend-swatch--${cat.id}" style="background-color: ${cat.color};"></span>
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
