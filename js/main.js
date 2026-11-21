/* ===== Feedback pop-up: built once here and added to every page, with a button in the footer ===== */
(() => {
  const dlg = document.createElement("dialog");
  if (!dlg.showModal) return;
  const SERVICES = ["Full Body Skin Toning", "Body Pigmentation Treatment", "Skin Brightening Treatment", "Laser Skin Rejuvenation", "Laser Toning", "Carbon Laser Facial", "Q-Switch Laser Treatment", "Picosecond Laser Treatment", "Laser Hair Reduction", "Chemical Peels", "HydraFacial", "Skin Booster", "Tattoo Removal", "Other"];
  const STAR = "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z";
  const stars = [5, 4, 3, 2, 1].map(n => `<input type="radio" id="fb-r${n}" name="rating" value="${n}"><label for="fb-r${n}"><span class="sr-only">${n} star${n > 1 ? "s" : ""}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg></label>`).join("");
  dlg.className = "modal modal--feedback"; dlg.id = "feedback-modal"; dlg.tabIndex = -1; dlg.setAttribute("aria-labelledby", "feedback-title");
  dlg.innerHTML = `<button class="modal__close" type="button" data-feedback-close aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
<form class="form modal__form" id="feedback-form" data-lead data-feedback novalidate>
<h2 id="feedback-title">Share your feedback</h2>
<p class="modal__lead">Tell us how your visit went. Your comments go to our team.</p>
<input type="hidden" name="type" value="feedback">
<div class="field-row">
<div class="field"><label for="fb-name">Name</label><input id="fb-name" name="name" type="text" autocomplete="name" required><span class="error" role="alert"></span></div>
<div class="field"><label for="fb-email">Email (optional)</label><input id="fb-email" name="email" type="email" autocomplete="email"><span class="error" role="alert"></span></div>
</div>
<div class="field"><label for="fb-service">Service (optional)</label><select id="fb-service" name="service"><option value="">Select a service</option>${SERVICES.map(s => `<option>${s}</option>`).join("")}</select></div>
<fieldset class="field rating-field"><legend>Your rating</legend><div class="stars">${stars}</div><span class="error" role="alert"></span></fieldset>
<div class="field"><label for="fb-message">Your feedback</label><textarea id="fb-message" name="message" required></textarea><span class="error" role="alert"></span></div>
<div class="hp" aria-hidden="true"><label>Leave empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<button class="btn btn--primary" type="submit">Submit Feedback</button>
<div class="form-status" role="status" aria-live="polite"></div>
<div class="feedback__mine" hidden></div>
</form>`;
  document.body.append(dlg);

  const open = () => {
    const mine = dlg.querySelector(".feedback__mine"), st = dlg.querySelector(".form-status");
    if (!mine.hidden) { mine.hidden = true; mine.textContent = ""; st.className = "form-status"; st.textContent = ""; } // fresh form after a sent one
    dlg.showModal(); document.body.classList.add("no-scroll");
    dlg.querySelector("input[name=name]").focus();
  };
  dlg.addEventListener("close", () => { if (!document.querySelector("dialog[open]")) document.body.classList.remove("no-scroll"); });
  dlg.querySelector("[data-feedback-close]").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); }); // click on the dimmed backdrop

  const list = document.querySelector(".footer-links");
  if (list) {
    const li = document.createElement("li"), b = document.createElement("button");
    b.type = "button"; b.className = "btn btn--outline"; b.textContent = "Submit Feedback"; b.setAttribute("data-feedback-open", "");
    li.append(b); list.append(li);
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-feedback-open]")) open(); });
  if (location.hash === "#feedback") open();
})();

/* ===== Single edit point for clinic details (edit here) ===== */
const CLINIC = {
  name: "Relish Skin & Laser Clinic",
  phone: "+91 97406 93485",
  whatsapp: "919740693485",
  email: "relish842@gmail.com",
  address: "1st Floor, No. 7 & 8, Muthanallur Cross, Sarjapur - Marathahalli Road, Dommasandra, Bengaluru, Karnataka 562125",
  formEndpoint: "https://script.google.com/macros/s/AKfycbwzGZIQmxytI5NG9McwcjljQ2Fp_0n3X8d9yHZSmXFLh0Ygcuj5ya1ozHOOT0tDgJHQ/exec", // Google Apps Script web app URL (ends with /exec)
  feedbackEndpoint: "", // Separate Apps Script web app URL for the feedback form (its own Google Sheet). Paste it here.
};

/* ===== Patient reviews (add ONLY real reviews that the patient has agreed to publish) =====
   One object per review: { name: "Priya S.", rating: 5, text: "Their own words.", source: "Google" }  (source is optional)
   The Reviews section on the home page stays hidden until this list has at least one entry. */
const REVIEWS = [
  // DEMO entries (their text starts with "Demo review:"). Replace them with real, consented reviews before promoting the site.
  { name: "Priya Sharma", rating: 4, text: "Demo review: Feedback about the overall clinic experience, staff behaviour and consultation." },
  { name: "Ananya Verma", rating: 4, text: "Demo review: Feedback about the Carbon Laser Facial experience and consultation process." },
  { name: "Sneha Kumar", rating: 4, text: "Demo review: Feedback about the HydraFacial session, clinic hygiene and overall experience." },
  { name: "Rahul Singh", rating: 4, text: "Demo review: Feedback about the Laser Hair Reduction consultation and treatment experience." },
  { name: "Megha Thakur", rating: 4, text: "Demo review: Feedback about the Chemical Peel treatment and guidance provided by the clinic." },
  { name: "Ritika Reddy", rating: 4, text: "Demo review: Feedback about the Laser Toning procedure and clinic professionalism." },
  { name: "Kavita Mishra", rating: 4, text: "Demo review: Feedback about the skin pigmentation consultation and treatment experience." },
  { name: "Arpita Gupta", rating: 4, text: "Demo review: Feedback about the Skin Booster treatment and attention received during the session." },
  { name: "Neha Choudhary", rating: 4, text: "Demo review: Feedback about the Picosecond Laser consultation and overall patient experience." },
  { name: "Ishita Rajput", rating: 4, text: "Demo review: Feedback about the clinic atmosphere, staff communication and treatment guidance." }
];

(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Fill contact placeholders: [data-clinic="phone|email|address"], [data-clinic-link="tel|mailto|wa"]
  $$("[data-clinic]").forEach(el => { el.textContent = CLINIC[el.dataset.clinic] || ""; });
  $$("[data-clinic-link]").forEach(el => {
    const t = el.dataset.clinicLink;
    if (t === "tel") el.href = "tel:" + CLINIC.phone.replace(/[^\d+]/g, "");
    if (t === "mailto") el.href = "mailto:" + CLINIC.email;
    if (t === "wa") el.href = "https://wa.me/" + CLINIC.whatsapp + "?text=" + encodeURIComponent("Hello, I'd like to book a consultation at " + CLINIC.name);
  });

  // Dynamic copyright year
  $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  // Mobile menu
  const toggle = $(".nav-toggle"), nav = $("#site-nav");
  if (toggle && nav) {
    const set = open => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("no-scroll", open);
    };
    toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", e => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { set(false); toggle.focus(); } });
    matchMedia("(min-width:1024px)").addEventListener("change", e => { if (e.matches) set(false); });
  }

  // Scroll reveal (CSS only hides these when JS is running, so no-JS visitors see everything)
  const revealEls = $$(".section-head,.card,.pr,.steps li,.banner,.faq details,.split>*,.contact-info,.form:not(.modal__form),.callout,.pr-note,.cta .container");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      en.target.classList.add("in");
      // hand control back to normal styles (hover effects etc.) once the fade is done
      setTimeout(() => en.target.classList.remove("reveal", "in"), 1600);
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => revealEls.includes(c));
      el.style.setProperty("--d", (sibs.indexOf(el) % 4) * 0.08 + "s");
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // Lead forms (contact page form and the pop-up): validation, honeypot, submit to CLINIC.formEndpoint
  const rules = {
    name: v => v.trim().length >= 2 || "Please enter your name.",
    phone: v => (/^\+?[\d\s\-()]{10,16}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 10) || "Please enter a valid phone number (at least 10 digits).",
    message: v => v.trim().length >= 10 || "Please write at least 10 characters.",
    email: v => !v.trim() || /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(v.trim()) || "Please enter a valid email address."
  };

  const initForm = form => {
    const status = $(".form-status", form), btn = $("button[type=submit]", form);
    const check = input => {
      const rule = rules[input.name]; if (!rule) return true;
      const r = rule(input.value), field = input.closest(".field"), err = $(".error", field);
      const ok = r === true;
      field.classList.toggle("invalid", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      if (err) {
        err.textContent = ok ? "" : r;
        if (!err.id) err.id = input.id + "-error";
        input.setAttribute("aria-describedby", err.id);
      }
      return ok;
    };
    const isFeedback = form.hasAttribute("data-feedback");
    const checkRating = () => {
      const field = form.elements.rating[0].closest(".field"), err = $(".error", field);
      const ok = !!form.elements.rating.value;
      field.classList.toggle("invalid", !ok);
      if (err) err.textContent = ok ? "" : "Please choose a star rating.";
      return ok;
    };
    // Shows the visitor's own entry under the form after a successful send (text only, never HTML)
    const showMine = (rating, text) => {
      const box = $(".feedback__mine", form); if (!box) return;
      box.textContent = "";
      const h = document.createElement("h3"); h.textContent = "What you sent";
      const stars = document.createElement("div"); stars.className = "review__stars"; stars.setAttribute("role", "img"); stars.setAttribute("aria-label", rating + " out of 5 stars");
      for (let i = 1; i <= 5; i++) {
        const sv = document.createElementNS("http://www.w3.org/2000/svg", "svg"); sv.setAttribute("viewBox", "0 0 24 24"); sv.setAttribute("aria-hidden", "true");
        if (i <= rating) sv.setAttribute("class", "on");
        const pa = document.createElementNS("http://www.w3.org/2000/svg", "path"); pa.setAttribute("d", "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"); sv.append(pa); stars.append(sv);
      }
      const p = document.createElement("p"); p.textContent = text;
      box.append(h, stars, p); box.hidden = false;
    };
    const show = (type, msg) => { status.className = "form-status" + (type ? " " + type : ""); status.textContent = msg; };
    $$("input,select,textarea", form).forEach(i => i.addEventListener("blur", () => check(i)));
    form.addEventListener("input", e => {
      if (e.target.name === "rating") { if (e.target.closest(".field.invalid")) checkRating(); return; }
      if (e.target.closest(".field.invalid")) check(e.target);
    });

    // Preselect service from ?service=
    const wanted = new URLSearchParams(location.search).get("service");
    if (wanted && form.elements.service && [...form.elements.service.options].some(o => o.value === wanted)) form.elements.service.value = wanted;

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (btn.disabled) return;
      const required = isFeedback ? ["name", "email", "message"] : ["name", "phone", "email"];
      const results = required.filter(n => form.elements[n]).map(n => check(form.elements[n]));
      if (isFeedback) results.push(checkRating());
      if (results.includes(false)) { form.querySelector(".invalid input, .invalid textarea").focus(); show("err", "Please fix the highlighted fields."); return; }
      if (form.elements.website.value) { show("ok", "Thank you! We will contact you soon."); form.reset(); return; } // honeypot: bots see success
      const endpoint = isFeedback ? CLINIC.feedbackEndpoint : CLINIC.formEndpoint;
      if (!endpoint) { show("err", isFeedback ? "Feedback cannot be sent right now. Please try again later." : "Online booking is not available right now. Please call or WhatsApp us."); return; }
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…"; show("", "");
      try {
        const data = new FormData(form); data.delete("website");
        const isGoogle = endpoint.includes("script.google.com");
        // Google Apps Script needs a "simple" request (no custom headers) or the browser blocks it
        const res = await fetch(endpoint, {
          method: "POST",
          body: new URLSearchParams(data),
          headers: isGoogle ? undefined : { Accept: "application/json" }
        });
        if (!res.ok) throw new Error(res.status);
        if (isGoogle) { const out = await res.json(); if (!out.ok) throw new Error("script error"); }
        if (isFeedback) showMine(Number(form.elements.rating.value), form.elements.message.value.trim());
        form.reset(); show("ok", isFeedback ? "Thank you for your feedback." : "Thank you! Your request has been sent. We will contact you soon.");
        form.dispatchEvent(new Event("lead:sent"));
      } catch (_) { // any failure (network, HTTP error, script error) gets the same visitor-facing message
        show("err", "Sorry, something went wrong. Please try again or call us.");
      } finally { btn.disabled = false; btn.textContent = label; }
    });
  };
  $$("form[data-lead]").forEach(initForm);

  // Patient reviews slider: native scroll-snap (swipe works on phones), arrows, dots, and auto-advance that can be paused
  const reviewsSection = $("#reviews");
  const reviews = REVIEWS.filter(r => r && r.name && r.text).map(r => ({
    name: String(r.name), text: String(r.text), source: r.source ? String(r.source) : "",
    rating: Math.min(5, Math.max(1, Math.round(Number(r.rating)) || 5))
  }));
  if (reviewsSection && reviews.length) {
    const mount = $("[data-reviews]", reviewsSection);
    const NS = "http://www.w3.org/2000/svg";
    const el = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) { n.className = cls; }
      if (text != null) { n.textContent = text; }
      return n;
    };
    const svg = (paths, cls) => {
      const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
      if (cls) s.setAttribute("class", cls);
      paths.forEach(d => { const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); s.append(p); });
      return s;
    };
    const btn = (cls, label, icon) => { const b = el("button", cls); b.type = "button"; b.setAttribute("aria-label", label); b.append(icon); return b; };
    const STAR = "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z";
    const PAUSE = ["M8 5v14", "M16 5v14"], PLAY = ["M7 4l13 8-13 8z"];
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

    mount.setAttribute("role", "region"); mount.setAttribute("aria-roledescription", "carousel"); mount.setAttribute("aria-label", "Patient reviews");
    const viewport = el("div", "reviews__viewport"); viewport.tabIndex = 0;
    viewport.setAttribute("aria-label", "Patient reviews. Use the left and right arrow keys to move between them.");
    const track = el("ul", "reviews__track");
    reviews.forEach((r, i) => {
      const li = el("li", "review"); li.setAttribute("aria-roledescription", "slide"); li.setAttribute("aria-label", `${i + 1} of ${reviews.length}`);
      const stars = el("div", "review__stars"); stars.setAttribute("role", "img"); stars.setAttribute("aria-label", `${r.rating} out of 5 stars`);
      for (let s = 1; s <= 5; s++) stars.append(svg([STAR], s <= r.rating ? "on" : ""));
      const quote = el("blockquote", "review__text"); quote.append(el("p", null, r.text));
      const who = el("p", "review__name", r.name); if (r.source) who.append(el("span", "review__source", " · " + r.source));
      li.append(stars, quote, who); track.append(li);
    });
    viewport.append(track);
    const prev = btn("reviews__btn", "Previous reviews", svg(["M15 5l-7 7 7 7"]));
    const next = btn("reviews__btn", "Next reviews", svg(["M9 5l7 7-7 7"]));
    const dots = el("div", "reviews__dots");
    const pause = btn("reviews__btn", "Pause automatic sliding", svg(PAUSE));
    const controls = el("div", "reviews__controls"); controls.append(prev, dots, next, pause);
    mount.append(viewport, controls);
    reviewsSection.hidden = false;

    const slides = $$(".review", track);
    let perView = 1, pages = 1, page = 0, userPaused = false, hovering = false, onScreen = true;
    const step = () => slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : slides[0].offsetWidth;
    const maxLeft = () => viewport.scrollWidth - viewport.clientWidth;
    const markDots = () => $$(".reviews__dot", dots).forEach((d, i) => d.setAttribute("aria-current", String(i === page)));
    const readPage = () => {
      page = viewport.scrollLeft >= maxLeft() - 2 ? pages - 1 : Math.min(pages - 1, Math.round(viewport.scrollLeft / (perView * step())));
      markDots();
    };
    const goTo = p => {
      page = (p + pages) % pages;
      viewport.scrollTo({ left: Math.min(page * perView * step(), maxLeft()), behavior: reduce ? "auto" : "smooth" });
      markDots();
    };
    const measure = () => {
      const st = step(), gap = st - slides[0].offsetWidth;
      perView = Math.max(1, Math.round((track.clientWidth + gap) / st));
      const count = Math.ceil(slides.length / perView);
      if (count !== pages || !dots.children.length) {
        pages = count; dots.textContent = "";
        for (let i = 0; i < pages; i++) { const d = el("button", "reviews__dot"); d.type = "button"; d.setAttribute("aria-label", `Show reviews page ${i + 1} of ${pages}`); d.addEventListener("click", () => goTo(i)); dots.append(d); }
      }
      controls.hidden = pages <= 1; mount.classList.toggle("reviews--few", pages <= 1);
      readPage();
    };
    prev.addEventListener("click", () => goTo(page - 1));
    next.addEventListener("click", () => goTo(page + 1));
    viewport.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(page - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(page + 1); }
    });
    let raf = 0; viewport.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(readPage); }, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(viewport); else addEventListener("resize", measure);

    // Auto-advance: off for reduced motion, paused while hovering/focused/off-screen/hidden tab or when the visitor pauses it
    const setPlaying = () => { viewport.setAttribute("aria-live", userPaused || reduce ? "polite" : "off"); };
    if (reduce) pause.hidden = true;
    pause.addEventListener("click", () => {
      userPaused = !userPaused; pause.setAttribute("aria-label", userPaused ? "Start automatic sliding" : "Pause automatic sliding");
      pause.replaceChildren(svg(userPaused ? PLAY : PAUSE)); setPlaying();
    });
    mount.addEventListener("mouseenter", () => { hovering = true; }); mount.addEventListener("mouseleave", () => { hovering = false; });
    mount.addEventListener("focusin", () => { hovering = true; }); mount.addEventListener("focusout", () => { hovering = false; });
    if ("IntersectionObserver" in window) new IntersectionObserver(en => { onScreen = en[0].isIntersecting; }).observe(mount);
    if (!reduce) setInterval(() => { if (pages > 1 && !userPaused && !hovering && onScreen && !document.hidden) goTo(page + 1); }, 7000);
    setPlaying(); measure();
  }

  // Optional pop-up enquiry form. It is opened by a small inline script in each page (so it appears at once);
  // here we only wire up closing it and remember a successful submission so it stops reappearing.
  const modal = $("#enquiry");
  if (modal) {
    modal.addEventListener("close", () => document.body.classList.toggle("no-scroll", false));
    $$("[data-modal-close]", modal).forEach(b => b.addEventListener("click", () => modal.close()));
    modal.addEventListener("click", e => { if (e.target === modal) modal.close(); }); // click on the dimmed backdrop
    $("form", modal).addEventListener("lead:sent", () => {
      try { sessionStorage.setItem("relish-enquiry-sent", "1"); } catch (_) { /* storage blocked: pop-up may show again */ }
      setTimeout(() => modal.close(), 2500);
    });
  }
})();
