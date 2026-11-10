# ---------------- main.js: floating form ----------------
p = "js/main.js"
s = open(p, encoding="utf-8").read()

old = '''  const persistentBtn = persistentCta.querySelector(".persistent-cta__btn");
  persistentBtn?.addEventListener("click", () => {
    persistentCta.classList.add("is-hidden");
    const firstInput = document.getElementById("interest-first-name");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 600);
    }
  });
}
'''
assert old in s
new = '''}

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

  document.querySelectorAll("[data-float-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (!dialog.open) dialog.showModal();
    });
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
'''
s = s.replace(old, new, 1)
s = s.replace('''    initPersistentCta();
    initHeroVideoPreview();
  });''', '''    initPersistentCta();
    initFloatingForm();
    initHeroVideoPreview();
  });''', 1)
s = s.replace('''  initPersistentCta();
  initHeroVideoPreview();
}''', '''  initPersistentCta();
  initFloatingForm();
  initHeroVideoPreview();
}''', 1)
open(p, "w", encoding="utf-8").write(s)

# ---------------- ttw-v2.js: marquee + hero stats ----------------
p = "js/ttw-v2.js"
s = open(p, encoding="utf-8").read()

old_start = s.index("function initMarquee(prefersReducedMotion) {")
old_end = s.index("/**\n * 3. Hero Stats")
new_marquee = '''function initMarquee(prefersReducedMotion) {
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

  // Seamless loop: a second copy of the set sits in the same track. Every card carries its own
  // trailing gap (margin, not flex gap/padding), so one set is exactly half of the track and
  // translateX(-50%) lands precisely on the start of the duplicate.
  const originalCards = [...track.children];
  originalCards.forEach((card) => {
    card.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      img.alt = "";
    });
    clone.querySelectorAll("a, button, [tabindex]").forEach((el) => el.setAttribute("tabindex", "-1"));
    track.appendChild(clone);
  });

  // Constant speed (px/second) at every breakpoint: duration follows the measured loop distance.
  const SPEED_PX_PER_SEC = 60;
  const syncLoop = () => {
    const distance = track.scrollWidth / 2;
    if (!distance) return;
    marquee.style.setProperty("--marquee-distance", `-${distance}px`);
    marquee.style.setProperty("--marquee-duration", `${(distance / SPEED_PX_PER_SEC).toFixed(2)}s`);
  };
  syncLoop();
  window.addEventListener("resize", syncLoop, { passive: true });
  track.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", syncLoop, { once: true });
  });

  marquee.classList.add("is-animating");
}

'''
s = s[:old_start] + new_marquee + s[old_end:]

# hero stats: keep footnote <sup> out of the split text, re-append after the last word
old = '''    const rawText = textEl.textContent.trim();
    item.setAttribute("aria-label", rawText);
    textEl.innerHTML = "";
'''
new = '''    // Keep an optional footnote reference (sup.hero-fn) intact: it is not split or animated per character.
    const fnRef = textEl.querySelector(".hero-fn");
    if (fnRef) fnRef.remove();
    const rawText = textEl.textContent.trim();
    item.setAttribute("aria-label", rawText);
    textEl.innerHTML = "";
'''
assert old in s
s = s.replace(old, new, 1)
old = '''        globalCharIndex++;
      }
    });
  });

  let currentIndex = 0;'''
new = '''        globalCharIndex++;
      }
    });

    if (fnRef) textEl.appendChild(fnRef);
  });

  let currentIndex = 0;'''
assert old in s
s = s.replace(old, new, 1)
open(p, "w", encoding="utf-8").write(s)
print("ok")
