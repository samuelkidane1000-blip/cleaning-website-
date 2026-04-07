document.documentElement.classList.add("js-reveal");

/* =========================
   ELEMENTS
========================= */

const menu = document.getElementById("premiumMenu");
const overlay = document.getElementById("menuOverlay");
const menuToggle = document.getElementById("menuToggle");
const menuClose = document.querySelector(".menu-close");
const menuItems = document.querySelectorAll(".premium-menu-nav a");

const menuAreasToggle = document.querySelector(".menu-areas-toggle");
const menuAreasList = document.getElementById("menuAreasList");

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

const reviewForm = document.getElementById("reviewForm");
const reviewSuccessMessage = document.getElementById("reviewSuccessMessage");

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
  if (successMessage) successMessage.hidden = true;
  if (errorMessage) errorMessage.hidden = true;
}

function showError(message) {
  if (!errorMessage || !errorText) return;
  errorText.textContent = message;
  errorMessage.hidden = false;
}

function showSuccess() {
  if (!successMessage || !successText) return;

  const firstName = nameInput?.value?.trim().split(" ")[0] || "";

  successText.textContent = firstName
    ? `Thank you, ${firstName}. We’ll contact you shortly.`
    : "Thank you. We’ll contact you shortly.";

  successMessage.hidden = false;
}

/* =========================
   QUOTE CALCULATOR
========================= */

function updateQuote() {
  if (!quoteTotal || !quoteBreakdown) return;

  const rate = parseFloat(serviceSelect?.value || "0");
  const hours = getSafeHours();
  const oven = ovenInput?.checked ? 25 : 0;
  const supplies = suppliesInput?.checked ? 20 : 0;
  const total = rate * hours + oven + supplies;

  quoteTotal.textContent = formatGBP(total);

  const extras = [];
  if (oven) extras.push("Inside oven clean");
  if (supplies) extras.push("Hoover & mop provided by us");

  const frequencyText =
    frequencySelect?.value === "One payment"
      ? "One-time service"
      : `${frequencySelect?.value || "Weekly"} service`;

  quoteBreakdown.textContent =
    `${hours} hour${hours > 1 ? "s" : ""} × ${formatGBP(rate)} • ${frequencyText}` +
    (extras.length ? ` • ${extras.join(" • ")}` : "") +
    " • No hidden fees";

  if (estimatedTotalInput) estimatedTotalInput.value = quoteTotal.textContent;
  if (quoteBreakdownInput) quoteBreakdownInput.value = quoteBreakdown.textContent;
  if (serviceLabelInput) serviceLabelInput.value = getServiceName();
  if (ovenExtraInput) ovenExtraInput.value = ovenInput?.checked ? "Yes" : "No";
  if (suppliesExtraInput) suppliesExtraInput.value = suppliesInput?.checked ? "Yes" : "No";
}

/* =========================
   BOOKING FORM
========================= */

function validateBookingForm() {
  hideMessages();

  if (!nameInput?.value.trim()) {
    showError("Please enter your name.");
    nameInput?.focus();
    return false;
  }

  if (!phoneInput?.value.trim()) {
    showError("Please enter your phone number.");
    phoneInput?.focus();
    return false;
  }

  if (!emailInput?.value.trim()) {
    showError("Please enter your email address.");
    emailInput?.focus();
    return false;
  }

  if (!emailInput.checkValidity()) {
    showError("Please enter a valid email address.");
    emailInput?.focus();
    return false;
  }

  if (!dateInput?.value) {
    showError("Please select a booking date.");
    dateInput?.focus();
    return false;
  }

  if (!timeInput?.value) {
    showError("Please select a booking time.");
    timeInput?.focus();
    return false;
  }

  if (dateInput.value < getTodayISO()) {
    showError("Please choose today or a future date.");
    dateInput?.focus();
    return false;
  }

  if (getSafeHours() < 2) {
    showError("Minimum booking is 2 hours.");
    hoursInput?.focus();
    return false;
  }

  if (consentInput && !consentInput.checked) {
    showError("Please accept the Privacy Policy before submitting.");
    consentInput?.focus();
    return false;
  }

  return true;
}

if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    updateQuote();

    if (!validateBookingForm()) return;

    try {
      const response = await fetch(bookingForm.action, {
        method: "POST",
        body: new FormData(bookingForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error();

      bookingForm.reset();
      showSuccess();

      if (hoursInput) hoursInput.value = "2";
      if (timeInput) timeInput.value = "10:00";

      updateQuote();
    } catch {
      showError("Something went wrong. Please try again.");
    }
  });
}

[serviceSelect, ovenInput, suppliesInput, frequencySelect].forEach((el) => {
  el?.addEventListener("change", updateQuote);
  el?.addEventListener("input", updateQuote);
});

hoursInput?.addEventListener("input", updateQuote);
hoursInput?.addEventListener("change", updateQuote);
hoursInput?.addEventListener("blur", () => {
  if (!hoursInput.value || parseInt(hoursInput.value, 10) < 2) {
    hoursInput.value = "2";
  }
  updateQuote();
});

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
menuItems.forEach((item) => item.addEventListener("click", closeMenu));

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* =========================
   MENU AREAS
========================= */

menuAreasToggle?.addEventListener("click", () => {
  const expanded = menuAreasToggle.getAttribute("aria-expanded") === "true";
  menuAreasToggle.setAttribute("aria-expanded", String(!expanded));

  if (menuAreasList) {
    if (expanded) {
      menuAreasList.setAttribute("hidden", "");
    } else {
      menuAreasList.removeAttribute("hidden");
    }
  }
});

/* =========================
   REVEAL
========================= */

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("is-visible"));
}

/* =========================
   REVIEW FORM
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
        reviewSuccessMessage.classList.add("active");
      }
    } catch {
      alert("There was a problem sending your review.");
    }
  });
}
