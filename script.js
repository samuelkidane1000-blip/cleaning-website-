"use strict";

/* =============================
   INIT
============================= */

document.documentElement.classList.add("js-reveal");

const $ = (id) => document.getElementById(id);

/* =============================
   ELEMENTS
============================= */

const form = $("bookingForm");
const submitBtn = form?.querySelector("button[type='submit']");

const service = $("service");
const hours = $("hours");
const oven = $("oven");
const supplies = $("supplies");
const frequency = $("frequency");

const totalEl = $("quoteTotal");
const breakdownEl = $("quoteBreakdown");

const successBox = $("successMessage");
const successText = $("successText");

const nameInput = $("name");
const phoneInput = $("phone");
const emailInput = $("email");
const dateInput = $("date");
const timeInput = $("time");

const year = $("year");

/* =============================
   HELPERS
============================= */

const GBP = (v) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(v);

const todayISO = () => new Date().toISOString().split("T")[0];

const safeHours = () => {
  const val = parseInt(hours.value, 10);
  return isNaN(val) || val < 2 ? 2 : val;
};

const serviceName = () => {
  const s = service.options[service.selectedIndex];
  return s.dataset.label || s.textContent.split("—")[0].trim();
};

/* =============================
   QUOTE
============================= */

function updateQuote() {
  if (!service) return;

  const rate = parseFloat(service.value);
  const h = safeHours();

  const extraOven = oven?.checked ? 25 : 0;
  const extraSupplies = supplies?.checked ? 20 : 0;

  const total = rate * h + extraOven + extraSupplies;

  totalEl.textContent = GBP(total);

  const extras = [];
  if (extraOven) extras.push("Oven");
  if (extraSupplies) extras.push("Supplies");

  const freq =
    frequency.value === "One payment"
      ? "One-time"
      : frequency.value;

  breakdownEl.textContent =
    `${h}h × ${GBP(rate)} • ${freq}` +
    (extras.length ? ` • ${extras.join(", ")}` : "") +
    " • No hidden fees";
}

/* =============================
   VALIDATION
============================= */

function validate() {
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  if (dateInput.value < todayISO()) {
    showError("Please choose a future date.");
    return false;
  }

  if (safeHours() < 2) {
    showError("Minimum booking is 2 hours.");
    return false;
  }

  return true;
}

/* =============================
   UI FEEDBACK
============================= */

function setLoading(state) {
  if (!submitBtn) return;

  submitBtn.disabled = state;
  submitBtn.textContent = state
    ? "Checking availability..."
    : "Check Availability & Book";
}

function showSuccess() {
  successBox.hidden = false;
  successText.textContent = `Thank you${
    nameInput.value ? ", " + nameInput.value.split(" ")[0] : ""
  }. We'll contact you shortly.`;

  successBox.focus();
}

function showError(msg) {
  let err = document.querySelector(".form-error");

  if (!err) {
    err = document.createElement("div");
    err.className = "form-error";
    err.style.cssText =
      "margin-top:10px;padding:12px;border-radius:12px;background:#ff4d4d22;border:1px solid #ff4d4d;color:#fff;font-size:14px;";
    form.appendChild(err);
  }

  err.textContent = msg;
}

/* =============================
   SUBMIT
============================= */

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  updateQuote();

  if (!validate()) return;

  setLoading(true);

  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });

    if (!res.ok) throw new Error();

    showSuccess();
    form.reset();
    hours.value = 2;
    updateQuote();
  } catch {
    showError("Something went wrong. Please try again or call us.");
  } finally {
    setLoading(false);
  }
});

/* =============================
   MENU
============================= */

const menu = $("premiumMenu");
const overlay = $("menuOverlay");
const toggle = $("menuToggle");
const closeBtn = document.querySelector(".menu-close");

toggle?.addEventListener("click", () => {
  menu.classList.toggle("is-open");
  overlay.classList.toggle("is-open");
  document.body.classList.toggle("menu-open");
});

closeBtn?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

function closeMenu() {
  menu.classList.remove("is-open");
  overlay.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

/* =============================
   REVEAL
============================= */

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver(
    (entries, o) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          o.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((r) => obs.observe(r));
} else {
  reveals.forEach((r) => r.classList.add("is-visible"));
}

/* =============================
   INIT
============================= */

if (dateInput) dateInput.min = todayISO();
if (year) year.textContent = new Date().getFullYear();

updateQuote();
