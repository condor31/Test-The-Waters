p = "index.html"
s = open(p, encoding="utf-8").read()

old = '''    <a class="btn btn-solid-blue cta-label persistent-cta__btn" href="#interested-form">Join the Notification List</a>
  </div>
</aside>
'''
new = '''    <button class="btn btn-solid-blue cta-label persistent-cta__btn" type="button" aria-haspopup="dialog" aria-controls="floating-form-dialog" data-float-open>Join the Notification List</button>
  </div>
</aside>

<!-- T28: Floating notification-list form. Same fields + same Mailchimp endpoint/handler pipeline as #interest-form. -->
<dialog class="float-dialog" id="floating-form-dialog" aria-labelledby="floating-form-title">
  <div class="float-dialog__panel">
    <button class="float-dialog__close" type="button" aria-label="Close the notification list form" data-float-close>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
    </button>
    <h2 class="h3 text-black float-dialog__title" id="floating-form-title">Ready to Help r.World Crush It Some More?</h2>

    <form
      class="cta-form validate"
      id="floating-interest-form"
      action="https://rworldreuse.us15.list-manage.com/subscribe/post?u=d16d76c3bd0a764ea148af923&amp;id=23a13695bf&amp;f_id=00ad9fe1f0"
      method="post"
      name="mc-embedded-subscribe-form-floating"
      target="_blank"
      novalidate
    >
      <div class="cta-form__grid">
        <div class="mc-field-group">
          <label class="visually-hidden" for="floating-first-name">First name *</label>
          <input class="cta-form__input required text" type="text" id="floating-first-name" name="FNAME" placeholder="First name *" autocomplete="given-name" required aria-required="true" value="" />
        </div>
        <div class="mc-field-group">
          <label class="visually-hidden" for="floating-last-name">Last name *</label>
          <input class="cta-form__input required text" type="text" id="floating-last-name" name="LNAME" placeholder="Last name *" autocomplete="family-name" required aria-required="true" value="" />
        </div>
      </div>
      <div class="cta-form__grid">
        <div class="mc-field-group">
          <label class="visually-hidden" for="floating-email">Email address *</label>
          <input class="cta-form__input required email" type="email" id="floating-email" name="EMAIL" placeholder="Email address *" autocomplete="email" required aria-required="true" value="" />
        </div>
        <div class="mc-field-group">
          <label class="visually-hidden" for="floating-phone">Phone number</label>
          <input class="cta-form__input text" type="tel" id="floating-phone" name="MMERGE4" placeholder="Phone (optional)" autocomplete="tel" value="" />
          <input type="hidden" name="MMERGE4[area]" value="" />
          <input type="hidden" name="MMERGE4[detail1]" value="" />
          <input type="hidden" name="MMERGE4[detail2]" value="" />
        </div>
      </div>

      <div hidden><input type="hidden" name="tags" value="1743734" /></div>

      <fieldset class="range-group mc-field-group input-group">
        <legend class="range-group__legend">Optional, nonbinding: How much might you consider investing?</legend>
        <div class="range-group__options">
          <label class="range-pill" for="floating-range-0"><input type="radio" name="MMERGE5" id="floating-range-0" value="500-1000" /><span>$500&ndash;$1,000</span></label>
          <label class="range-pill" for="floating-range-1"><input type="radio" name="MMERGE5" id="floating-range-1" value="1000-5000" /><span>$1,000&ndash;$5,000</span></label>
          <label class="range-pill" for="floating-range-2"><input type="radio" name="MMERGE5" id="floating-range-2" value="5000-25000" /><span>$5,000&ndash;$25,000</span></label>
          <label class="range-pill" for="floating-range-3"><input type="radio" name="MMERGE5" id="floating-range-3" value="25000+" /><span>$25,000+</span></label>
        </div>
      </fieldset>

      <div aria-hidden="true" style="position: absolute; left: -5000px;">
        <input type="text" name="b_d16d76c3bd0a764ea148af923_23a13695bf" tabindex="-1" value="" />
      </div>

      <div class="cta-form__error" id="floating-form-error" role="alert" aria-live="assertive" hidden></div>

      <button class="btn btn-solid-blue cta-label cta-form__submit button" type="submit" name="subscribe" id="floating-subscribe-btn">Join the Notification List</button>
      <p class="form-disclaimer p-small">Joining this list does not reserve shares, allocations, pricing, priority or any investment rights. No money will be accepted.</p>

      <div class="rule-206-legend" data-rule-206-legend>
        <p class="legend-citation">This communication is being used for &ldquo;testing the waters&rdquo; pursuant to 17 CFR &sect; 227.206.</p>
        <ul class="legend-bullets">
          <li>No money or other consideration is being solicited, and if sent in response, will not be accepted;</li>
          <li>No offer to buy the securities can be accepted and no part of the purchase price can be received until the offering statement is filed and only through the platform of an intermediary (funding portal or broker-dealer); and</li>
          <li>A person&rsquo;s indication of interest includes no obligation or commitment of any kind.</li>
        </ul>
      </div>
    </form>

    <div class="cta-form__success" id="floating-form-success" role="status" aria-live="polite" hidden>
      <div class="cta-form__success-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <p class="cta-form__success-title">You&rsquo;re on the list.</p>
      <p class="cta-form__success-desc">No payment. No commitment. We&rsquo;ll email you when the offering opens.</p>
    </div>
  </div>
</dialog>
'''
assert old in s
s = s.replace(old, new, 1)
open(p, "w", encoding="utf-8").write(s)
print("ok")
