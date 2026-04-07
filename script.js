document.documentElement.classList.add("js-reveal");

/* =========================
   ELEMENTS
========================= */

const menu = document.getElementById("premiumMenu");
const overlay = document.getElementById("menuOverlay");
const menuToggle = document.getElementById("menuToggle");
const menuClose = document.querySelector(".menu-close");
const menuItems = document.querySelectorAll(".premium-menu-nav a");

const menuBookBtn = document.querySelector(".premium-menu-btn");
const menuCallBtn = document.querySelector(".premium-menu-call");

const menuAreasToggle = document.querySelector(".menu-areas-toggle");
const menuAreasList = document.getElementById("menuAreasList");
const premiumMenuBody = document.querySelector(".premium-menu-body");

const serviceSelect = document.getElementById("service");
const hoursInput = document.getElementById("hours");
const ovenInput = document.getElementById("oven");
const suppliesInput = document.getElementById("supplies");
const frequencySelect = document.getElementById("frequency");
const quoteTotal = document.getElementById("quoteTotal");
const quoteBreakdown = document.getElementById("quoteBreakdown");

const bookingForm = document.getElementById("bookingForm");
const successMessage = document.getElementById("successMessage");
const successText = document.getElementById("successText");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const submitBookingBtn = document.getElementById("submitBookingBtn");

const estimatedTotalInput = document.getElementById("estimatedTotalInput");
const quoteBreakdownInput = document.getElementById("quoteBreakdownInput");
const serviceLabelInput = document.getElementById("serviceLabelInput");
const ovenExtraInput = document.getElementById("ovenExtraInput");
const suppliesExtraInput = document.getElementById("suppliesExtraInput");

const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const consentInput = document.getElementById("consent");

const year = document.getElementById("year");

/* =========================
   HELPERS
========================= */

function formatGBP(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(value);
}

function getTodayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function getSafeHours() {
  const val = parseInt(hoursInput?.value || "2", 10);
  return Number.isNaN(val) || val < 2 ? 2 : val;
}

function getServiceName() {
  const selected = serviceSelect?.options[serviceSelect.selectedIndex];
  return selected?.dataset.label || "Cleaning";
}

function hideMessages() {
  successMessage && (successMessage.hidden = true);
  errorMessage && (errorMessage.hidden = true);
}

function showError(message) {
  if (!errorMessage) return;
  errorText.textContent = message;
  errorMessage.hidden = false;
}

function showSuccess() {
  if (!successMessage) return;

  const firstName = nameInput?.value?.split(" ")[0] || "";

  successText.textContent = firstName
    ? `Thank you, ${firstName}. We’ll contact you shortly.`
    : "Thank you. We’ll contact you shortly.";

  successMessage.hidden = false;
}

/* =========================
   QUOTE CALCULATOR
========================= */

function updateQuote() {
  const rate = parseFloat(serviceSelect?.value || "0");
  const hours = getSafeHours();
  const oven = ovenInput?.checked ? 25 : 0;
  const supplies = suppliesInput?.checked ? 20 : 0;

  const total = rate * hours + oven + supplies;

  quoteTotal.textContent = formatGBP(total);

  quoteBreakdown.textContent =
    `${hours}h × ${formatGBP(rate)} • ${frequencySelect.value}`;

  estimatedTotalInput.value = quoteTotal.textContent;
}

/* =========================
   BOOKING FORM
========================= */

if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    hideMessages();
    updateQuote();

    try {
      const response = await fetch(bookingForm.action, {
        method: "POST",
        body: new FormData(bookingForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error();

      bookingForm.reset();
      showSuccess();
      updateQuote();

    } catch {
      showError("Something went wrong. Please try again.");
    }
  });
}

/* =========================
   MENU
========================= */

function openMenu() {
  menu?.classList.add("is-open");
  overlay?.classList.add("is-open");
  document.body.classList.add("menu-open");
}

function closeMenu() {
  menu?.classList.remove("is-open");
  overlay?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", openMenu);
menuClose?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

menuItems.forEach(i => i.addEventListener("click", closeMenu));

/* =========================
   MENU AREAS
========================= */

menuAreasToggle?.addEventListener("click", () => {
  const expanded = menuAreasToggle.getAttribute("aria-expanded") === "true";

  menuAreasToggle.setAttribute("aria-expanded", !expanded);
  menuAreasList.toggleAttribute("hidden");
});

/* =========================
   REVEAL
========================= */

const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
});

revealItems.forEach(el => observer.observe(el));

/* =========================
   REVIEW FORM (FIXED)
========================= */

const reviewForm = document.getElementById("reviewForm");
const reviewSuccessMessage = document.getElementById("reviewSuccessMessage");

if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(reviewForm.action, {
        method: "POST",
        body: new FormData(reviewForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error();

      reviewForm.reset();

      if (reviewSuccessMessage) {
        reviewSuccessMessage.hidden = false;
      }

    } catch {
      alert("Error sending review. Try again.");
    }
  });
}

/* =========================
   INIT
========================= */

dateInput && (dateInput.min = getTodayISO());
year && (year.textContent = new Date().getFullYear());

updateQuote();
hideMessages();
