document.documentElement.classList.add("js-reveal");

const serviceSelect = document.getElementById("service");
const hoursInput = document.getElementById("hours");
const ovenInput = document.getElementById("oven");
const suppliesInput = document.getElementById("supplies");
const frequencySelect = document.getElementById("frequency");
const quoteTotal = document.getElementById("quoteTotal");
const quoteBreakdown = document.getElementById("quoteBreakdown");
const bookingForm = document.getElementById("bookingForm");
const successMessage = document.getElementById("successMessage");
const year = document.getElementById("year");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const footerToggle = document.querySelector(".footer-toggle");
const areasList = document.getElementById("areasList");

const menu = document.getElementById("premiumMenu");
const overlay = document.getElementById("menuOverlay");
const menuToggle = document.getElementById("menuToggle");
const menuClose = document.querySelector(".menu-close");
const menuItems = document.querySelectorAll(".premium-menu-nav .menu-item");

let lastFocusedElement = null;

function formatGBP(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(value);
}

function getServiceName() {
  if (!serviceSelect) return "Cleaning";
  const selected = serviceSelect.options[serviceSelect.selectedIndex];
  return selected?.dataset.label || selected?.textContent.split("—")[0].trim() || "Cleaning";
}

function getHoursValue() {
  if (!hoursInput) return 2;
  const raw = hoursInput.value.trim();

  if (raw === "") return "";
  const parsed = parseInt(raw, 10);

  if (Number.isNaN(parsed)) return "";
  return parsed;
}

function getSafeHours() {
  const hours = getHoursValue();
  if (hours === "") return 2;
  return Math.max(2, hours);
}

function getTodayLocalISODate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function updateQuote() {
  if (!serviceSelect || !frequencySelect || !quoteTotal || !quoteBreakdown) return;

  const hourlyRate = parseFloat(serviceSelect.value || "0");
  const rawHours = getHoursValue();
  const hours = rawHours === "" ? 2 : Math.max(2, rawHours);
  const oven = ovenInput?.checked ? parseFloat(ovenInput.value || "0") : 0;
  const supplies = suppliesInput?.checked ? parseFloat(suppliesInput.value || "0") : 0;
  const total = (hourlyRate * hours) + oven + supplies;

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
    ` • No hidden fees`;
}

function saveBookingLocally(booking) {
  try {
    const existing = JSON.parse(localStorage.getItem("nestlynBookings") || "[]");
    existing.unshift(booking);
    localStorage.setItem("nestlynBookings", JSON.stringify(existing));
  } catch (error) {
    console.warn("Could not save booking to localStorage.", error);
  }
}

function validateForm() {
  if (!bookingForm) return false;

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return false;
  }

  if (dateInput?.value && dateInput.value < getTodayLocalISODate()) {
    dateInput.setCustomValidity("Please choose today or a future date.");
    dateInput.reportValidity();
    return false;
  } else {
    dateInput?.setCustomValidity("");
  }

  if (hoursInput) {
    const currentHours = getHoursValue();

    if (currentHours === "" || currentHours < 2) {
      hoursInput.setCustomValidity("Minimum booking is 2 hours.");
      hoursInput.reportValidity();
      return false;
    } else {
      hoursInput.setCustomValidity("");
    }
  }

  return true;
}

function showSuccessMessage() {
  if (!successMessage) return;
  successMessage.hidden = false;
  successMessage.focus();
}

function resetBookingForm() {
  if (!bookingForm) return;

  bookingForm.reset();

  if (hoursInput) hoursInput.value = "2";
  if (frequencySelect) frequencySelect.value = "Weekly";
  if (timeInput) timeInput.value = "10:00";

  updateQuote();
}

function buildWhatsAppMessage(booking) {
  const extrasList = [];
  if (booking.extras.oven) extrasList.push("Inside oven clean");
  if (booking.extras.supplies) extrasList.push("Hoover & mop provided by us");

  return `Hi Nestlyn Clean, I'd like to book:

Service: ${booking.service}
Frequency: ${booking.frequency}
Hours: ${booking.hours}
Date: ${booking.date}
Time: ${booking.time}
Extras: ${extrasList.length ? extrasList.join(", ") : "None"}
Estimated total: ${booking.total}

Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email}`;
}

function openMenu() {
  if (!menu || !overlay) return;

  lastFocusedElement = document.activeElement;

  menu.classList.add("is-open");
  overlay.classList.add("is-open");
  menu.setAttribute("aria-hidden", "false");
  overlay.setAttribute("aria-hidden", "false");
  menuToggle?.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");

  menuClose?.focus();
}

function closeMenu() {
  if (!menu || !overlay) return;

  menu.classList.remove("is-open");
  overlay.classList.remove("is-open");
  menu.setAttribute("aria-hidden", "true");
  overlay.setAttribute("aria-hidden", "true");
  menuToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  } else {
    menuToggle?.focus();
  }
}

function toggleMenu() {
  if (!menu) return;
  const isOpen = menu.classList.contains("is-open");
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

function trapFocusInMenu(event) {
  if (!menu || menu.getAttribute("aria-hidden") === "true" || event.key !== "Tab") return;

  const focusableElements = menu.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );

  if (!focusableElements.length) return;

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

[serviceSelect, ovenInput, suppliesInput, frequencySelect].forEach((el) => {
  el?.addEventListener("input", updateQuote);
  el?.addEventListener("change", updateQuote);
});

hoursInput?.addEventListener("input", updateQuote);
hoursInput?.addEventListener("change", updateQuote);
hoursInput?.addEventListener("blur", () => {
  const value = getHoursValue();
  if (value === "" || value < 2) {
    hoursInput.value = "2";
  }
  updateQuote();
});

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  updateQuote();

  if (!validateForm()) return;

  const booking = {
    name: nameInput?.value.trim() || "",
    phone: phoneInput?.value.trim() || "",
    email: emailInput?.value.trim() || "",
    service: getServiceName(),
    frequency: frequencySelect?.value || "",
    hours: String(getSafeHours()),
    date: dateInput?.value || "",
    time: timeInput?.value || "",
    extras: {
      oven: !!ovenInput?.checked,
      supplies: !!suppliesInput?.checked
    },
    total: quoteTotal?.textContent || "",
    createdAt: new Date().toISOString()
  };

  saveBookingLocally(booking);
  showSuccessMessage();

  const whatsappMessage = buildWhatsAppMessage(booking);
  const whatsappURL = `https://wa.me/447514718173?text=${encodeURIComponent(whatsappMessage)}`;

  window.open(whatsappURL, "_blank", "noopener");
  resetBookingForm();
});

menuToggle?.addEventListener("click", toggleMenu);
menuClose?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    menuItems.forEach((link) => link.classList.remove("is-active"));
    item.classList.add("is-active");
    closeMenu();
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }

  trapFocusInMenu(event);
});

footerToggle?.addEventListener("click", () => {
  if (!areasList) return;

  const expanded = footerToggle.getAttribute("aria-expanded") === "true";
  footerToggle.setAttribute("aria-expanded", String(!expanded));

  if (expanded) {
    areasList.classList.remove("is-open");
    areasList.setAttribute("hidden", "");
  } else {
    areasList.classList.add("is-open");
    areasList.removeAttribute("hidden");
  }
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (dateInput) {
  dateInput.min = getTodayLocalISODate();
}

if (year) {
  year.textContent = new Date().getFullYear();
}

if (hoursInput && !hoursInput.value) {
  hoursInput.value = "2";
}

if (timeInput && !timeInput.value) {
  timeInput.value = "10:00";
}

if (areasList && window.innerWidth <= 768) {
  areasList.setAttribute("hidden", "");
}

updateQuote();
