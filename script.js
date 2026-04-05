document.documentElement.classList.add("js-reveal");

/* =========================
   ELEMENTS
========================= */

const menu = document.getElementById("premiumMenu");
const overlay = document.getElementById("menuOverlay");
const menuToggle = document.getElementById("menuToggle");
const menuClose = document.querySelector(".menu-close");
const menuItems = document.querySelectorAll(".premium-menu-nav a");

/* =========================
   MENU FUNCTIONS
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

/* =========================
   MENU EVENTS (FIXED)
========================= */

menuToggle?.addEventListener("click", toggleMenu);
menuClose?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

/* 🔥 THIS IS THE FIX YOU NEEDED */
menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    closeMenu();
  });
});

/* Close with ESC */
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* =========================
   SMOOTH SCROLL OFFSET FIX
========================= */

const links = document.querySelectorAll('a[href^="#"]');

links.forEach((link) => {
  link.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");

    if (targetId.length > 1) {
      const target = document.querySelector(targetId);

      if (target) {
        e.preventDefault();

        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: "smooth"
        });
      }
    }
  });
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
   YEAR AUTO UPDATE
========================= */

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
