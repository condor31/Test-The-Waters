import { MAP_CATEGORIES, STATE_STATUSES, STATE_NAMES, WASH_HUBS } from "./map-config.js?v=20261021_04";
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
          errorEl.setAttribute("tabindex", "-1");
          errorEl.focus();
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
          errorEl.setAttribute("tabindex", "-1");
          errorEl.focus();
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

  function getStep() {
    const firstSlide = slides[0];
    if (!firstSlide) return 320;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || 24);
    return firstSlide.offsetWidth + gap;
  }

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

  function scrollStep(direction) {
    const step = getStep();
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  function updateUI() {
    const idx = closestIndex();
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 4;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll - 4;
    dots.forEach((dot, i) => {
      const isActive = i === idx;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  if (prevBtn) prevBtn.addEventListener("click", () => scrollStep(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollStep(1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => scrollToIndex(i)));

  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollStep(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollStep(1);
    }
  });

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
const RWORLD_LOGO_PATHS = `
<path d="M63.2319 0C36.2623 0 14.3432 21.6161 13.7372 48.3836C10.8079 48.7877 8.58569 51.3129 8.58569 54.2422C8.58569 57.5755 11.2119 60.2018 14.5453 60.2018C17.8786 60.2018 20.5048 57.5755 20.5048 54.2422C20.5048 51.4139 18.4846 48.9897 15.8584 48.3836C15.9594 42.3231 17.1715 36.4645 19.5957 30.909C22.02 25.2524 25.3533 20.2019 29.6967 15.8585C34.0401 11.5151 39.0906 8.08077 44.7472 5.75755C50.6057 3.33332 56.7673 2.02019 63.1309 2.02019C69.4945 2.02019 75.7571 3.23231 81.5147 5.75755C87.1712 8.18178 92.2217 11.5151 96.5651 15.8585C100.909 20.2019 104.343 25.2524 106.666 30.909C107.474 32.7271 108.08 34.6463 108.585 36.5655C109.292 36.3635 109.898 36.1615 110.605 36.0605C105.151 15.2525 85.9591 0 63.2319 0Z" class="wash-hub-path" fill="white"/>
<path d="M5.65654 60.3037H0V49.4956C0 43.233 5.15149 38.0815 11.4141 38.0815V43.7381C8.18178 43.7381 5.55553 46.3643 5.55553 49.5966V60.3037H5.65654Z" class="wash-hub-path" fill="white"/>
<path d="M65.2522 38.0815C58.9896 38.0815 53.8381 43.233 53.8381 49.4956C53.8381 55.7582 58.9896 60.9097 65.2522 60.9097C71.5148 60.9097 76.6663 55.7582 76.6663 49.4956C76.6663 43.233 71.5148 38.0815 65.2522 38.0815ZM65.2522 55.3542C62.0199 55.3542 59.3937 52.7279 59.3937 49.4956C59.3937 46.2633 62.0199 43.6371 65.2522 43.6371C68.4845 43.6371 71.1108 46.2633 71.1108 49.4956C71.1108 52.7279 68.4845 55.3542 65.2522 55.3542Z" class="wash-hub-path" fill="white"/>
<path d="M98.7874 31.1118H93.1309V60.2026H98.7874V31.1118Z" class="wash-hub-path" fill="white"/>
<path d="M46.1613 52.2223C46.1613 53.9395 44.7472 55.3536 43.03 55.3536C41.3129 55.3536 39.8987 53.9395 39.8987 52.2223V38.687H34.3432V52.1213C34.3432 53.8385 32.9291 55.2526 31.2119 55.2526C29.4947 55.2526 28.0806 53.8385 28.0806 52.1213V38.687H22.4241V52.1213C22.4241 56.9698 26.3634 60.9091 31.2119 60.9091C33.5351 60.9091 35.5553 60.0001 37.1715 58.5859C38.6866 60.0001 40.8078 60.9091 43.1311 60.9091C47.9795 60.9091 51.9189 56.9698 51.9189 52.1213V38.687H46.2624V52.2223H46.1613Z" class="wash-hub-path" fill="white"/>
<path d="M78.6868 49.4951V60.3031H84.3433V49.4951C84.3433 46.2628 86.9696 43.6365 90.2019 43.6365H91.212V37.98H90.2019C83.8383 38.081 78.6868 43.2325 78.6868 49.4951Z" class="wash-hub-path" fill="white"/>
<path d="M117.979 31.1113V39.8992C116.464 38.6871 114.141 37.98 112.121 37.98C105.858 37.98 100.707 43.1315 100.707 49.3941C100.707 54.7476 104.343 59.192 109.292 60.5051C108.686 63.0304 107.878 65.4546 106.868 67.8788C104.444 73.5354 101.111 78.5859 96.7673 82.9293C92.4238 87.2727 87.3734 90.707 81.7168 93.0303C75.8583 95.4545 69.6967 96.7676 63.3331 96.7676C56.9694 96.7676 50.7068 95.5555 44.9493 93.0303C39.2928 90.606 34.2423 87.2727 29.8989 82.9293C25.5554 78.5859 22.1211 73.5354 19.7979 67.8788C18.9898 65.8587 18.2827 63.8385 17.6767 61.7173C17.0706 62.0203 16.3636 62.2223 15.6565 62.3233C21.212 83.5354 40.4039 98.9898 63.232 98.9898C86.6663 98.9898 106.262 82.7273 111.414 60.9092C111.717 60.9092 111.919 60.9092 112.222 60.9092C118.484 60.9092 123.636 55.7577 123.636 49.4951V31.1113H117.979ZM112.222 55.3537C108.989 55.3537 106.363 52.7274 106.363 49.4951C106.363 46.2628 108.989 43.6365 112.222 43.6365C115.454 43.6365 118.08 46.2628 118.08 49.4951C117.979 52.7274 115.454 55.3537 112.222 55.3537Z" class="wash-hub-path" fill="white"/>
<path d="M36.768 72.0197C36.768 70.3025 38.0811 69.1914 39.6973 69.1914C40.1013 69.1914 40.6064 69.2924 40.9094 69.3934L40.5054 70.7066C40.3033 70.6055 39.8993 70.6055 39.5963 70.6055C38.7882 70.6055 38.2831 71.2116 38.2831 72.0197V76.7671H36.667V72.0197H36.768Z" class="wash-hub-path" fill="white"/>
<path d="M41.4146 72.2217C41.4146 70.2015 42.7277 69.1914 44.3438 69.1914C45.96 69.1914 47.2731 70.3025 47.2731 72.0197V73.6358H43.0307V73.9389C43.0307 75.05 43.6368 75.656 44.5458 75.656C45.2529 75.656 45.859 75.555 46.566 75.353L46.8691 76.7671C46.061 77.0702 45.4549 77.1712 44.5458 77.1712C42.6267 77.1712 41.4146 76.0601 41.4146 74.0399V72.2217ZM45.5559 72.3227V72.0197C45.5559 71.2116 45.0509 70.7066 44.2428 70.7066C43.5358 70.7066 42.9297 71.2116 42.9297 72.1207V72.3227H45.5559Z" class="wash-hub-path" fill="white"/>
<path d="M48.5862 69.3936H50.2023V73.838C50.2023 74.9491 50.7074 75.5552 51.5155 75.5552C52.3235 75.5552 52.8286 74.9491 52.8286 73.838V69.3936H54.5458V73.939C54.5458 75.9592 53.2326 76.9693 51.6165 76.9693C50.0003 76.9693 48.6872 75.9592 48.6872 73.939V69.3936H48.5862Z" class="wash-hub-path" fill="white"/>
<path d="M55.9603 75.1514C56.5663 75.3534 57.2734 75.4544 57.8794 75.4544C58.4855 75.4544 58.9905 75.1514 58.9905 74.6464C58.9905 73.2322 55.8592 73.7373 55.8592 71.212C55.8592 69.9999 56.8693 69.0908 58.4855 69.0908C59.1926 69.0908 59.7986 69.1918 60.5057 69.3938L60.1017 70.808C59.5966 70.606 59.0916 70.505 58.4855 70.505C57.7784 70.505 57.5764 70.808 57.5764 71.212C57.5764 72.5251 60.7077 71.9191 60.7077 74.6464C60.7077 75.7575 59.7986 76.8686 57.8794 76.8686C57.0714 76.8686 56.3643 76.7676 55.6572 76.4645L55.9603 75.1514Z" class="wash-hub-path" fill="white"/>
<path d="M64.2423 72.2223H65.4544V71.9192C65.4544 71.1111 65.0503 70.6061 64.2423 70.6061C63.5352 70.6061 62.9291 70.8081 62.2221 71.0101L61.818 69.697C62.6261 69.495 63.3332 69.293 64.1413 69.293C65.8584 69.293 66.9695 70.4041 66.9695 72.0202V74.5455C66.9695 75.9596 65.6564 77.0707 64.1413 77.0707C62.5251 77.0707 61.313 75.9596 61.313 74.5455C61.414 73.0303 62.6261 72.2223 64.2423 72.2223ZM64.2423 75.5556C64.9493 75.5556 65.3534 75.0505 65.3534 74.5455V73.5354H64.1413C63.3332 73.5354 63.0302 74.0404 63.0302 74.5455C63.1312 75.0505 63.5352 75.5556 64.2423 75.5556Z" class="wash-hub-path" fill="white"/>
<path d="M68.2827 66.3631L69.9999 66.0601V69.4944C70.3029 69.2924 70.909 69.0903 71.515 69.0903C73.0302 69.0903 74.4443 70.1004 74.4443 72.2216V73.8378C74.4443 75.858 73.0302 76.9691 71.414 76.9691C69.7979 76.9691 68.3837 75.858 68.3837 73.8378V66.3631H68.2827ZM71.313 75.555C72.1211 75.555 72.6261 74.9489 72.6261 73.8378V72.4237C72.6261 71.1105 72.0201 70.7065 71.313 70.7065C70.808 70.7065 70.4039 70.9085 69.9999 71.1105V73.9388C69.9999 74.9489 70.5049 75.555 71.313 75.555Z" class="wash-hub-path" fill="white"/>
<path d="M75.7581 66.4642L77.4752 66.1611V76.7671H75.7581V66.4642Z" class="wash-hub-path" fill="white"/>
<path d="M78.8892 72.2217C78.8892 70.2015 80.2023 69.1914 81.8184 69.1914C83.4346 69.1914 84.7477 70.3025 84.7477 72.0197V73.6358H80.5053V73.9389C80.5053 75.05 81.1114 75.656 82.0205 75.656C82.7275 75.656 83.3336 75.555 84.0407 75.353L84.3437 76.7671C83.5356 77.0702 82.9295 77.1712 82.0205 77.1712C80.1013 77.1712 78.8892 76.0601 78.8892 74.0399V72.2217ZM83.1316 72.3227V72.0197C83.1316 71.2116 82.6265 70.7066 81.8184 70.7066C81.1114 70.7066 80.5053 71.2116 80.5053 72.1207V72.3227H83.1316Z" class="wash-hub-path" fill="white"/>
<path d="M85.96 75.1514C86.5661 75.3534 87.2731 75.4544 87.8792 75.4544C88.4853 75.4544 88.9903 75.1514 88.9903 74.6464C88.9903 73.2322 85.859 73.7373 85.859 71.212C85.859 69.9999 86.8691 69.0908 88.4852 69.0908C89.1923 69.0908 89.7984 69.1918 90.5054 69.3938L90.1014 70.808C89.5964 70.606 89.0913 70.505 88.4852 70.505C87.7782 70.505 87.5762 70.808 87.5762 71.212C87.5762 72.5251 90.7075 71.9191 90.7075 74.6464C90.7075 75.7575 89.7984 76.8686 87.8792 76.8686C87.0711 76.8686 86.3641 76.7676 85.657 76.4645L85.96 75.1514Z" class="wash-hub-path" fill="white"/>
<path d="M125.758 33.6361V31.616H125.051V31.2119H126.97L126.869 31.616H126.162V33.6361H125.758ZM129.394 33.6361L129.192 31.919L128.687 33.3331H128.283L127.778 31.919L127.576 33.6361H127.172L127.475 31.2119H127.98L128.586 32.7271L129.192 31.2119H129.697L130 33.6361H129.394Z" class="wash-hub-path" fill="white"/>
`.trim();

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
    const categoriesHtml = MAP_CATEGORIES.map((cat) => `
      <div class="reuse-legend-item reuse-legend-item--${cat.id}" data-category="${cat.id}" title="${cat.description}">
        <span class="reuse-legend-swatch reuse-legend-swatch--${cat.id}" style="background-color: ${cat.color};"></span>
        <span class="reuse-legend-label"><strong>${cat.label}</strong></span>
      </div>
    `).join("");

const hubLegendHtml = `
      <div class="reuse-legend-item reuse-legend-item--hubs" data-category="hubs" title="r.World regional wash hubs operating in 5 major metro areas.">
        <span class="reuse-legend-swatch reuse-legend-swatch--hub" aria-hidden="true">
          <svg viewBox="-20 -15 170 130" width="100%" height="100%" fill="none" aria-hidden="true">
            ${RWORLD_LOGO_PATHS}
          </svg>
        </span>
        <span class="reuse-legend-label"><strong>r.World Wash Hubs (5 locations)</strong></span>
      </div>
    `;

    legendContainer.innerHTML = categoriesHtml + hubLegendHtml;

    // Interactive highlight on legend hover & keyboard focus
    legendContainer.querySelectorAll(".reuse-legend-item").forEach((item) => {
      const catId = item.getAttribute("data-category");
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `Filter map by ${item.textContent.trim()}`);

      const activate = () => {
        if (catId === "hubs") {
          const hubsGroup = mapSvg.querySelector(".wash-hubs-group");
          if (hubsGroup) hubsGroup.classList.add("is-legend-active");
          return;
        }
        stateElements.forEach((el) => {
          const code = el.getAttribute("data-state")?.toLowerCase();
          const stateCat = STATE_STATUSES[code] || "other";
          el.style.opacity = stateCat === catId ? "1" : "0.35";
        });
      };

      const deactivate = () => {
        if (catId === "hubs") {
          const hubsGroup = mapSvg.querySelector(".wash-hubs-group");
          if (hubsGroup) hubsGroup.classList.remove("is-legend-active");
          return;
        }
        stateElements.forEach((el) => {
          el.style.opacity = "1";
        });
      };

      item.addEventListener("mouseenter", activate);
      item.addEventListener("mouseleave", deactivate);
      item.addEventListener("focus", activate);
      item.addEventListener("blur", deactivate);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        } else if (e.key === "Escape") {
          deactivate();
        }
      });
    });
  }

  // Layer r.World wash hub locations onto the map
  if (WASH_HUBS && WASH_HUBS.length) {
    let hubsGroup = mapSvg.querySelector(".wash-hubs-group");
    if (!hubsGroup) {
      hubsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      hubsGroup.setAttribute("class", "wash-hubs-group");
      mapSvg.appendChild(hubsGroup);
    }
    hubsGroup.innerHTML = "";

    WASH_HUBS.forEach((hub) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "wash-hub-marker");
      g.setAttribute("data-hub", hub.id);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `r.World Wash Hub: ${hub.name}`);

      // Pulse ring (decorative, pointer-events: none in CSS)
      const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      pulse.setAttribute("class", "wash-hub-pulse");
      pulse.setAttribute("cx", hub.x);
      pulse.setAttribute("cy", hub.y);
      pulse.setAttribute("r", "24");
      pulse.setAttribute("fill", "none");
      pulse.setAttribute("stroke", "rgba(255, 255, 255, 0.7)");
      pulse.setAttribute("stroke-width", "2");

      // Pin body with subtle grey circle underneath + r.World logo
      const pin = document.createElementNS("http://www.w3.org/2000/svg", "g");
      pin.setAttribute("class", "wash-hub-pin");
      pin.setAttribute("transform", `translate(${hub.x}, ${hub.y}) scale(0.51)`);
      pin.innerHTML = `
        <circle class="wash-hub-bg" cx="0" cy="0" r="46" />
        <g class="wash-hub-logo" transform="translate(-36.4, -27.7) scale(0.56)">
          ${RWORLD_LOGO_PATHS}
        </g>
      `;

      // Snug stationary hit target matching the marker (never transforms)
      const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hitArea.setAttribute("class", "wash-hub-hit");
      hitArea.setAttribute("cx", hub.x);
      hitArea.setAttribute("cy", hub.y);
      hitArea.setAttribute("r", "26");
      hitArea.setAttribute("fill", "transparent");
      hitArea.setAttribute("stroke", "none");

      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = `r.World Wash Hub: ${hub.name}`;
      g.appendChild(title);
      g.appendChild(pulse);
      g.appendChild(pin);
      g.appendChild(hitArea);

      // Anchored tooltip: locks firmly above the hub without cursor jitter/waggling
      const showTooltip = () => {
        let tt = document.querySelector(".reuse-map__tooltip");
        if (tt) {
          tt.textContent = `r.World Wash Hub: ${hub.name}`;
          const rect = hitArea.getBoundingClientRect();
          tt.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
          tt.style.top = `${rect.top + window.scrollY - 6}px`;
          tt.style.opacity = "1";
        }
      };

      const hideTooltip = () => {
        let tt = document.querySelector(".reuse-map__tooltip");
        if (tt) {
          tt.style.opacity = "0";
        }
      };

      g.addEventListener("mouseenter", showTooltip);
      g.addEventListener("mouseleave", hideTooltip);
      g.addEventListener("focus", showTooltip);
      g.addEventListener("blur", hideTooltip);
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showTooltip();
        } else if (e.key === "Escape") {
          hideTooltip();
        }
      });

      hubsGroup.appendChild(g);
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

    const showStateTooltip = (x, y) => {
      tooltip.textContent = `${stateName}: ${statusText}`;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.style.opacity = "1";
    };

    const hideStateTooltip = () => {
      tooltip.style.opacity = "0";
    };

    el.addEventListener("mouseenter", (e) => showStateTooltip(e.pageX, e.pageY));
    el.addEventListener("mousemove", (e) => {
      tooltip.style.left = `${e.pageX}px`;
      tooltip.style.top = `${e.pageY}px`;
    });
    el.addEventListener("mouseleave", hideStateTooltip);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initReuseMap();
    initPersistentCta();
    initFloatingForm();
    initHeroVideoPreview();
  });
} else {
  initReuseMap();
  initPersistentCta();
  initFloatingForm();
  initHeroVideoPreview();
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

}

// T28: Floating notification-list form (native <dialog>: focus trap, Esc, and focus-return come with showModal()).
// Uses the same fields and the same Mailchimp + backup-sheet pipeline as the main #interest-form.
function initFloatingForm() {
  const dialog = document.getElementById("floating-form-dialog");
  const form = document.getElementById("floating-interest-form");
  if (!dialog || !form || typeof dialog.showModal !== "function") return;

  const successEl = document.getElementById("floating-form-success");
  const errorEl = document.getElementById("floating-form-error");
  const titleEl = document.getElementById("floating-form-title");
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : "Join the Notification List";

  const reset = () => {
    form.reset();
    form.hidden = false;
    if (titleEl) titleEl.hidden = false;
    if (successEl) successEl.hidden = true;
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  };

  const openDialog = (e) => {
    if (e) e.preventDefault();
    if (!dialog.open) {
      dialog.showModal();
      const firstInput = form.querySelector("input:not([type=hidden])");
      if (firstInput) firstInput.focus();
    }
  };

  document.querySelectorAll("[data-float-open]").forEach((trigger) => {
    trigger.addEventListener("click", openDialog);
  });

  // Intercept any anchor links targeting the bottom interest form from elsewhere on the page
  document.querySelectorAll('a[href="#interested-form"]').forEach((link) => {
    link.addEventListener("click", openDialog);
  });

  // Airtight modal focus trap
  dialog.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusable = dialog.querySelectorAll(
      'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  dialog.querySelectorAll("[data-float-close]").forEach((btn) => btn.addEventListener("click", () => dialog.close()));
  // Click on the dimmed backdrop (outside the panel) closes it.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    // Fresh form next time (e.g. after a successful signup on a shared device)
    if (successEl && !successEl.hidden) reset();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const val = (name) => (form.querySelector(`[name="${name}"]`)?.value || "").trim();
    const firstNameVal = val("FNAME");
    const lastNameVal = val("LNAME");
    const emailVal = val("EMAIL");
    const phoneVal = val("MMERGE4");
    const honeypotVal = val("b_d16d76c3bd0a764ea148af923_23a13695bf");
    const rangeVal = form.querySelector('[name="MMERGE5"]:checked')?.value || "";

    const mailchimpParams = {
      EMAIL: emailVal,
      FNAME: firstNameVal,
      LNAME: lastNameVal,
      tags: "1743734",
      b_d16d76c3bd0a764ea148af923_23a13695bf: honeypotVal,
    };
    addPhoneParams(mailchimpParams, phoneVal, form);
    if (rangeVal) mailchimpParams.MMERGE5 = rangeVal;

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
      source: "Floating Form (Mailchimp)",
      timestamp: new Date().toLocaleString(),
    };

    try {
      const response = await submitLeadToMailchimp(mailchimpParams);
      if (response && response.result === "error") {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
        if (errorEl) {
          errorEl.textContent = formatMailchimpError(response.msg);
          errorEl.hidden = false;
          errorEl.setAttribute("tabindex", "-1");
          errorEl.focus();
        }
        return;
      }
    } catch (err) {
      console.warn("[Mailchimp] JSONP blocked or failed, falling back to iframe POST:", err);
      submitViaHiddenIframe(mailchimpParams);
    }

    triggerCelebrationConfetti(submitBtn);
    if (titleEl) titleEl.hidden = true;
    form.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.setAttribute("tabindex", "-1");
      successEl.focus();
    }

    try {
      submitLeadToGoogleSheet(googlePayload);
    } catch (err) {
      console.error("Backup Google Sheet submission failed:", err);
    }
  });
}

// Hero Video In-Page Player
function initHeroVideoPreview() {
  const container = document.getElementById("hero-video-player");
  if (!container) return;

  const trigger = container.querySelector(".interest-card__video-thumb-btn");
  const playerWrap = container.querySelector(".interest-card__video-player-wrap");
  const iframeSlot = container.querySelector(".interest-card__video-iframe-slot");
  const closeBtn = container.querySelector(".interest-card__video-close");
  const videoId = container.dataset.videoId || "TXxys99LGoM";

  function playVideo() {
    if (!iframeSlot) return;
    iframeSlot.innerHTML = `<iframe class="interest-card__video-iframe" src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="How r.World Works" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    container.classList.add("is-playing");
    if (playerWrap) {
      playerWrap.hidden = false;
      playerWrap.setAttribute("role", "dialog");
      playerWrap.setAttribute("aria-modal", "true");
      playerWrap.setAttribute("aria-label", "How r.World Works video player");
    }
    setTimeout(() => {
      closeBtn?.focus();
    }, 50);
  }

  function stopVideo() {
    if (!iframeSlot) return;
    iframeSlot.innerHTML = "";
    container.classList.remove("is-playing");
    if (playerWrap) playerWrap.hidden = true;
    trigger?.focus();
  }

  trigger?.addEventListener("click", playVideo);
  closeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    stopVideo();
  });

  playerWrap?.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const focusables = playerWrap.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1']), iframe");
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && container.classList.contains("is-playing")) {
      stopVideo();
    }
  });
}

// Hero Background Video Pause/Play & prefers-reduced-motion
function initHeroBackgroundVideo() {
  const toggleBtn = document.querySelector("[data-video-toggle]");
  const video = document.querySelector(".hero__media video, .hero-v2__reel, .hero-pre-reel__video");
  if (!toggleBtn || !video) return;

  const pauseIcon = toggleBtn.querySelector(".hero__video-toggle-icon--pause");
  const playIcon = toggleBtn.querySelector(".hero__video-toggle-icon--play");

  function setPausedState(isPaused) {
    if (isPaused) {
      video.pause();
      toggleBtn.setAttribute("aria-label", "Play background video");
      if (pauseIcon) pauseIcon.style.display = "none";
      if (playIcon) playIcon.style.display = "block";
    } else {
      video.play().catch(() => {});
      toggleBtn.setAttribute("aria-label", "Pause background video");
      if (pauseIcon) pauseIcon.style.display = "block";
      if (playIcon) playIcon.style.display = "none";
    }
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motionQuery.matches) {
    setPausedState(true);
  }

  motionQuery.addEventListener("change", (e) => {
    if (e.matches) {
      setPausedState(true);
    }
  });

  toggleBtn.addEventListener("click", () => {
    setPausedState(!video.paused);
  });
}

// Setup live validation accessibility helpers
[heroInterestForm, interestForm].forEach((form) => {
  if (!form) return;
  form.querySelectorAll(".cta-form__input").forEach((input) => {
    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
    });
    input.addEventListener("invalid", () => {
      input.setAttribute("aria-invalid", "true");
    });
  });
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initHeroBackgroundVideo();
  });
} else {
  initHeroBackgroundVideo();
}

