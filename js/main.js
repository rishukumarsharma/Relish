/* ===== Single edit point for clinic details (edit here) ===== */
const CLINIC = {
  name: "Relish Skin & Laser Clinic",
  phone: "+91 81470 89556",
  whatsapp: "918147089556",
  email: "relish842@gmail.com",
  address: "1st Floor, No. 7 & 8, Muthanallur Cross, Sarjapur - Marathahalli Road, Dommasandra, Bengaluru, Karnataka 562125",
  hours: "Monday to Sunday, 9:00 AM to 8:00 PM",
  formEndpoint: "https://script.google.com/macros/s/AKfycbwzGZIQmxytI5NG9McwcjljQ2Fp_0n3X8d9yHZSmXFLh0Ygcuj5ya1ozHOOT0tDgJHQ/exec", // Google Apps Script web app URL (ends with /exec)
};

(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Fill contact placeholders: [data-clinic="phone|email|address|hours"], [data-clinic-link="tel|mailto|wa"]
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
  const revealEls = $$(".section-head,.card,.pr,.quote,.steps li,.gallery figure,.banner,.faq details,.split>*,.contact-info,.form,.callout,.pr-note,.cta .container");
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

  // Contact form: validation, honeypot, fetch submit (Formspree / Web3Forms via CLINIC.formEndpoint)
  const form = $("#contact-form");
  if (form) {
    const status = $("#form-status"), btn = $("button[type=submit]", form);
    const rules = {
      name: v => v.trim().length >= 2 || "Please enter your name.",
      phone: v => (/^\+?[\d\s\-()]{10,16}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 10) || "Please enter a valid phone number (at least 10 digits).",
      email: v => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address."
    };
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
    if (wanted && [...form.service.options].some(o => o.value === wanted)) form.service.value = wanted;

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (btn.disabled) return;
      const results = ["name", "phone", "email"].map(n => check(form.elements[n]));
      if (results.includes(false)) { form.querySelector(".invalid input").focus(); show("err", "Please fix the highlighted fields."); return; }
      if (form.website.value) { show("ok", "Thank you! We will contact you soon."); form.reset(); return; } // honeypot: bots see success
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
      } catch (_) {
        show("err", "Sorry, something went wrong. Please try again or call us.");
      } finally { btn.disabled = false; btn.textContent = label; }
    });
  }
})();
