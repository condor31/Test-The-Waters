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

document.querySelectorAll("[data-video-placeholder]").forEach((button) => {
  button.addEventListener("click", () => {
    button.setAttribute("aria-disabled", "true");
    button.textContent = "Video coming soon";
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
