"use strict";

/* =============================
   INIT
============================= */

document.documentElement.classList.add("js-reveal");

/* =============================
   ELEMENTS
============================= */

const el = (id) => document.getElementById(id);

const serviceSelect = el("service");
const hoursInput = el("hours");
const ovenInput = el("oven");
const suppliesInput = el("supplies");
const frequencySelect = el("frequency");

const quoteTotal = el("quoteTotal");
const quoteBreakdown = el("quoteBreakdown");

const bookingForm = el("bookingForm");
const successMessage = el("successMessage");
const successText = el("successText");

const year = el("year");

const dateInput = el("date");
const timeInput = el("time");

const nameInput = el("name");
const phoneInput = el("phone");
const emailInput = el("email");

const footerToggle = document.querySelector(".footer-toggle");
const areasList = el("areasList");

const estimatedTotalInput = el("estimatedTotalInput");
const quoteBreakdownInput = el("quoteBreakdownInput");
const serviceLabelInput = el("serviceLabelInput");
const ovenExtraInput = el("ovenExtraInput");
const suppliesExtraInput = el("suppliesExtraInput");

const menu = el("premiumMenu");
const overlay = el("menuOverlay");
const menuToggle = el("menuToggle");
const menuClose = document.querySelector(".menu-close");
const menuItems = document.querySelectorAll(".premium-menu-nav .menu-item");

let lastFocusedElement = null;

/* =============================
   HELPERS
============================= */

const formatGBP = (value) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(value);

const getServiceName = () => {
  if (!serviceSelect) return "Cleaning";
  const selected = serviceSelect.options[serviceSelect.selectedIndex];
  return selected?.dataset.label || selected?.textContent.split("—")[0].trim();
};

const getHoursValue = () => {
  if (!hoursInput) return 2;

  const raw = hoursInput.value.trim();
  if (raw === "") return "";

  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? "" : parsed;
};

const getSafeHours = () => {
  const h = getHoursValue();
  return h === "" ? 2 : Math.max(2, h);
};

const getTodayISO = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

/* =============================
   QUOTE CALCULATION
============================= */

function updateQuote() {
  if (!serviceSelect || !quoteTotal || !quoteBreakdown) return;

  const rate = parseFloat(serviceSelect.value || "0");
  const hours = getSafeHours();

  const oven = ovenInput?.checked ? Number(ovenInput.value) : 0;
  const supplies = suppliesInput?.checked ? Number(suppliesInput.value) : 0;

  const total = rate * hours + oven + supplies;

  quoteTotal.textContent = formatGBP(total);

  const extras = [];
  if (oven) extras.push("Inside oven clean");
  if (supplies) extras.push("Hoover & mop");

  const freq =
    frequencySelect?.value === "One payment"
      ? "One-time service"
      : `${frequencySelect?.value} service`;

  quoteBreakdown.textContent =
    `${hours}h × ${formatGBP(rate)} • ${freq}` +
    (extras.length ? ` • ${extras.join(" • ")}` : "") +
    " • No hidden fees";

  /* hidden inputs */
  if (estimatedTotalInput) estimatedTotalInput.value = quoteTotal.textContent;
  if (quoteBreakdownInput) quoteBreakdownInput.value = quoteBreakdown.textContent;
  if (serviceLabelInput) serviceLabelInput.value = getServiceName();
  if (ovenExtraInput) ovenExtraInput.value = oven ? "Yes" : "No";
  if (suppliesExtraInput) suppliesExtraInput.value = supplies ? "Yes" : "No";
}

/* =============================
   VALIDATION
============================= */

function validateForm() {
  if (!bookingForm) return false;

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return false;
  }

  if (dateInput.value < getTodayISO()) {
    dateInput.setCustomValidity("Please choose a future date.");
    dateInput.reportValidity();
    return false;
  } else {
    dateInput.setCustomValidity("");
  }

  const hours = getHoursValue();
  if (hours === "" || hours < 2) {
    hoursInput.setCustomValidity("Minimum is 2 hours.");
    hoursInput.reportValidity();
    return false;
  } else {
    hoursInput.setCustomValidity("");
  }

  return true;
}

/* =============================
   SUCCESS
============================= */

function showSuccess() {
  if (!successMessage) return;

  const name = nameInput.value.trim();
  const first = name.split(" ")[0];

  successText.textContent = name
    ? `Thank you, ${first}. We’ll contact you shortly.`
    : "Thank you. We’ll contact you shortly.";

  successMessage.hidden = false;
  successMessage.focus();
}

function resetForm() {
  bookingForm.reset();

  hoursInput.value = "2";
  frequencySelect.value = "Weekly";
  timeInput.value = "10:00";

  updateQuote();
}

/* =============================
   FORM SUBMIT
============================= */

bookingForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  updateQuote();
  if (!validateForm()) return;

  const formData = new FormData(bookingForm);

  try {
    const res = await fetch(bookingForm.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    });

    if (!res.ok) throw new Error();

    showSuccess();
    resetForm();
  } catch {
    alert("Something went wrong. Please try again.");
  }
});

/* =============================
   MENU
============================= */

function openMenu() {
  lastFocusedElement = document.activeElement;

  menu.classList.add("is-open");
  overlay.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");

  menuClose.focus();
}

function closeMenu() {
  menu.classList.remove("is-open");
  overlay.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");

  lastFocusedElement?.focus();
}

menuToggle?.addEventListener("click", () =>
  menu.classList.contains("is-open") ? closeMenu() : openMenu()
);

menuClose?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* =============================
   FOOTER
============================= */

footerToggle?.addEventListener("click", () => {
  const open = footerToggle.getAttribute("aria-expanded") === "true";
  footerToggle.setAttribute("aria-expanded", String(!open));

  areasList.toggleAttribute("hidden");
  areasList.classList.toggle("is-open");
});

/* =============================
   REVEAL
============================= */

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("is-visible"));
}

/* =============================
   INIT VALUES
============================= */

if (dateInput) dateInput.min = getTodayISO();
if (year) year.textContent = new Date().getFullYear();

updateQuote();
