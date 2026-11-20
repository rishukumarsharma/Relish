/* ===== Single edit point for clinic details (edit here) ===== */
const CLINIC = {
  name: "Relish Skin & Laser Clinic",
  phone: "+91 97406 93485",
  whatsapp: "919740693485",
  email: "relish842@gmail.com",
  address: "1st Floor, No. 7 & 8, Muthanallur Cross, Sarjapur - Marathahalli Road, Dommasandra, Bengaluru, Karnataka 562125",
  formEndpoint: "https://script.google.com/macros/s/AKfycbwzGZIQmxytI5NG9McwcjljQ2Fp_0n3X8d9yHZSmXFLh0Ygcuj5ya1ozHOOT0tDgJHQ/exec", // Google Apps Script web app URL (ends with /exec)
};

/* ===== Patient reviews (add ONLY real reviews that the patient has agreed to publish) =====
   One object per review: { name: "Priya S.", rating: 5, text: "Their own words.", source: "Google" }  (source is optional)
   The Reviews section on the home page stays hidden until this list has at least one entry. */
const REVIEWS = [];

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
    const show = (type, msg) => { status.className = "form-status" + (type ? " " + type : ""); status.textContent = msg; };
    $$("input,select,textarea", form).forEach(i => i.addEventListener("blur", () => check(i)));
    form.addEventListener("input", e => { if (e.target.closest(".field.invalid")) check(e.target); });

    // Preselect service from ?service=
    const wanted = new URLSearchParams(location.search).get("service");
    if (wanted && form.elements.service && [...form.elements.service.options].some(o => o.value === wanted)) form.elements.service.value = wanted;

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (btn.disabled) return;
      const results = ["name", "phone", "email"].filter(n => form.elements[n]).map(n => check(form.elements[n]));
      if (results.includes(false)) { form.querySelector(".invalid input").focus(); show("err", "Please fix the highlighted fields."); return; }
      if (form.elements.website.value) { show("ok", "Thank you! We will contact you soon."); form.reset(); return; } // honeypot: bots see success
      if (!CLINIC.formEndpoint) { show("err", "Online booking is not available right now. Please call or WhatsApp us."); return; }
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…"; show("", "");
      try {
        const data = new FormData(form); data.delete("website");
        const isGoogle = CLINIC.formEndpoint.includes("script.google.com");
        // Google Apps Script needs a "simple" request (no custom headers) or the browser blocks it
        const res = await fetch(CLINIC.formEndpoint, {
          method: "POST",
          body: new URLSearchParams(data),
          headers: isGoogle ? undefined : { Accept: "application/json" }
        });
        if (!res.ok) throw new Error(res.status);
        if (isGoogle) { const out = await res.json(); if (!out.ok) throw new Error("script error"); }
        form.reset(); show("ok", "Thank you! Your request has been sent. We will contact you soon.");
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
