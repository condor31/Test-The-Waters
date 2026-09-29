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

const interestForm = document.getElementById("interest-form");
if (interestForm) {
  interestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!interestForm.reportValidity()) return;

    // TODO: replace with a real submission endpoint (email capture service / CRM webhook).
    const successMessage = document.getElementById("interest-form-success");
    interestForm.hidden = true;
    if (successMessage) {
      successMessage.hidden = false;
      successMessage.setAttribute("tabindex", "-1");
      successMessage.focus();
    }
  });
}

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const prevBtn = carousel.querySelector("[data-carousel-prev]");
  const nextBtn = carousel.querySelector("[data-carousel-next]");
  const dots = [...(carousel.parentElement.querySelectorAll("[data-carousel-dot]") || [])];
  const slides = [...track.children];

  function closestIndex() {
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

const floatingCta = document.getElementById("floating-cta");
if (floatingCta) {
  const defaultView = floatingCta.querySelector("[data-floating-cta-default]");
  const formView = floatingCta.querySelector("[data-floating-cta-form]");
  const successView = floatingCta.querySelector("[data-floating-cta-success]");
  const expandBtn = floatingCta.querySelector("[data-floating-cta-expand]");
  const cancelBtn = floatingCta.querySelector("[data-floating-cta-cancel]");
  const hideBtn = floatingCta.querySelector("[data-floating-cta-hide]");
  const emailInput = floatingCta.querySelector("#floating-cta-email");
  let dismissedForGood = false;

  try {
    if (sessionStorage.getItem("rworld-floating-cta-hidden") === "1") {
      dismissedForGood = true;
      floatingCta.classList.add("is-hidden");
    }
  } catch (e) {}

  hideBtn?.addEventListener("click", () => {
    dismissedForGood = true;
    floatingCta.classList.add("is-hidden");
    try {
      sessionStorage.setItem("rworld-floating-cta-hidden", "1");
    } catch (e) {}
  });

  const interestFormSection = document.getElementById("interested-form");
  if (interestFormSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (dismissedForGood) return;
        entries.forEach((entry) => {
          floatingCta.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(interestFormSection);
  }

  expandBtn?.addEventListener("click", () => {
    defaultView.hidden = true;
    formView.hidden = false;
    emailInput?.focus();
  });

  cancelBtn?.addEventListener("click", () => {
    formView.hidden = true;
    formView.reset();
    defaultView.hidden = false;
    expandBtn?.focus();
  });

  formView?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!formView.reportValidity()) return;

    // TODO: replace with a real submission endpoint (email capture service / CRM webhook).
    formView.hidden = true;
    successView.hidden = false;
    dismissedForGood = true;
    setTimeout(() => {
      floatingCta.classList.add("is-hidden");
    }, 2500);
  });
}
