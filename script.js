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
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getSafeHours() {
  if (!hoursInput) return 2;
  const val = parseInt(hoursInput.value, 10);
  if (Number.isNaN(val) || val < 2) return 2;
  return val;
}

function getServiceName() {
  if (!serviceSelect) return "Cleaning";
  const selected = serviceSelect.options[serviceSelect.selectedIndex];
  return selected?.dataset.label || selected?.textContent.split("—")[0].trim() || "Cleaning";
}

function hideMessages() {
  if (successMessage) successMessage.hidden = true;
  if (errorMessage) errorMessage.hidden = true;
}

function showError(message) {
  if (!errorMessage || !errorText) return;
  errorText.textContent = message;
  errorMessage.hidden = false;
  errorMessage.focus();
}

function showSuccess() {
  if (!successMessage || !successText) return;

  const name = nameInput?.value.trim() || "";
  const firstName = name ? name.split(" ")[0] : "";

  successText.textContent = firstName
    ? `Thank you, ${firstName}. We’ll contact you shortly.`
    : "Thank you. We’ll contact you shortly.";

  successMessage.hidden = false;
  successMessage.focus();
}

function setSubmitLoading(isLoading) {
  if (!submitBookingBtn) return;
  submitBookingBtn.disabled = isLoading;
  submitBookingBtn.textContent = isLoading
    ? "Checking availability..."
    : "Check Availability & Book";
}

/* =========================
   QUOTE CALCULATOR
========================= */

function updateQuote() {
  if (!serviceSelect || !quoteTotal || !quoteBreakdown || !frequencySelect) return;

  const hourlyRate = parseFloat(serviceSelect.value || "0");
  const hours = getSafeHours();
  const oven = ovenInput?.checked ? parseFloat(ovenInput.value || "0") : 0;
  const supplies = suppliesInput?.checked ? parseFloat(suppliesInput.value || "0") : 0;
  const total = hourlyRate * hours + oven + supplies;

  quoteTotal.textContent = formatGBP(total);

  const extras = [];
  if (oven) extras.push("Inside oven clean");
  if (supplies) extras.push("Hoover & mop provided by us");

  const frequencyText =
    frequencySelect.value === "One payment"
      ? "One-time service"
      : `${frequencySelect.value} service`;

  quoteBreakdown.textContent =
    `${hours} hour${hours > 1 ? "s" : ""} × ${formatGBP(hourlyRate)} • ${frequencyText}` +
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
  if (!bookingForm) return false;

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

  if (hoursInput && getSafeHours() < 2) {
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

    hideMessages();
    updateQuote();

    if (!validateBookingForm()) return;

    setSubmitLoading(true);

    try {
      const response = await fetch(bookingForm.action, {
        method: "POST",
        body: new FormData(bookingForm),
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      showSuccess();
      bookingForm.reset();

      if (hoursInput) hoursInput.value = "2";
      if (timeInput) timeInput.value = "10:00";

      updateQuote();
    } catch (error) {
      showError("There was a problem sending your booking. Please try again or call us.");
    } finally {
      setSubmitLoading(false);
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
  if (hoursInput && (!hoursInput.value || parseInt(hoursInput.value, 10) < 2)) {
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

function toggleMenu() {
  const isOpen = menu?.classList.contains("is-open");
  isOpen ? closeMenu() : openMenu();
}

menuToggle?.addEventListener("click", toggleMenu);
menuClose?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    closeMenu();
  });
});

menuBookBtn?.addEventListener("click", () => {
  closeMenu();
});

menuCallBtn?.addEventListener("click", () => {
  closeMenu();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* =========================
   MENU AREAS TOGGLE
========================= */

menuAreasToggle?.addEventListener("click", () => {
  const expanded = menuAreasToggle.getAttribute("aria-expanded") === "true";

  menuAreasToggle.setAttribute("aria-expanded", String(!expanded));

  if (expanded) {
    menuAreasList?.setAttribute("hidden", "");
  } else {
    menuAreasList?.removeAttribute("hidden");

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (premiumMenuBody && menuAreasList) {
          const top = menuAreasList.offsetTop - premiumMenuBody.offsetTop - 12;

          premiumMenuBody.scrollTo({
            top,
            behavior: "smooth"
          });
        }
      }, 80);
    });
  }
});

/* =========================
   REVEAL ANIMATION
========================= */

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* =========================
   REVIEWS SLIDER
========================= */

window.addEventListener("load", () => {
  const slider = document.getElementById("reviewsSlider");
  const slides = document.querySelectorAll("#reviewsSlider .review-card");
  const dotsContainer = document.getElementById("reviewDots");

  if (!slider || !slides.length || !dotsContainer) return;

  let currentIndex = 0;
  let autoSlide = null;
  let startX = 0;
  let endX = 0;

  dotsContainer.innerHTML = "";

  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    if (index === 0) dot.classList.add("active");

    dot.addEventListener("click", () => {
      showSlide(index);
      restartAutoSlide();
    });

    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll("span");

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    currentIndex = index;
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlide = setInterval(nextSlide, 3500);
  }

  function stopAutoSlide() {
    if (autoSlide) {
      clearInterval(autoSlide);
      autoSlide = null;
    }
  }

  function restartAutoSlide() {
    startAutoSlide();
  }

  slider.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    endX = startX;
    stopAutoSlide();
  }, { passive: true });

  slider.addEventListener("touchmove", (e) => {
    endX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener("touchend", () => {
    const diff = startX - endX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    startX = 0;
    endX = 0;
    restartAutoSlide();
  });

  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", restartAutoSlide);

  showSlide(0);
  startAutoSlide();
});

/* =========================
   INIT
========================= */

if (dateInput) dateInput.min = getTodayISO();
if (year) year.textContent = new Date().getFullYear();
if (hoursInput && !hoursInput.value) hoursInput.value = "2";
if (timeInput && !timeInput.value) timeInput.value = "10:00";

updateQuote();
hideMessages();
