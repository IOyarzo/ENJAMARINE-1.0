const nav = document.querySelector(".nav");
const menu = document.querySelector(".menu");
const links = document.querySelector(".links");
const progress = document.querySelector(".scroll-progress");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("scroll", () => {
  nav?.classList.toggle("scrolled", window.scrollY > 40);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress && max > 0) {
    progress.style.width = `${(window.scrollY / max) * 100}%`;
  }
});

menu?.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
});

links?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    links.classList.remove("open");
    menu?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("aria-label", "Abrir menú");
  });
});

const form = document.getElementById("lead-form");
const note = document.getElementById("form-note");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  note.hidden = false;
  form.reset();
});

const shots = document.querySelectorAll(".shot");
shots.forEach((shot) => {
  shot.addEventListener("click", () => {
    const on = shot.classList.toggle("is-on");
    shots.forEach((item) => {
      if (item !== shot) item.classList.remove("is-on");
    });
    if (!on) shot.classList.remove("is-on");
  });
});

const cards = document.querySelectorAll(".card");
cards.forEach((card) => {
  card.addEventListener("click", () => {
    const wasActive = card.classList.contains("is-active");
    cards.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    if (!wasActive) {
      card.classList.add("is-active");
      card.setAttribute("aria-pressed", "true");
    }
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

if (window.gsap && window.ScrollTrigger && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".hero-content > *", {
    y: 36,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out",
  });

  gsap.from(".about", {
    scrollTrigger: { trigger: ".about", start: "top 82%" },
    y: 24,
    opacity: 0,
    duration: 0.7,
    ease: "power2.out",
  });


  gsap.from(".shot", {
    scrollTrigger: {
      trigger: "#servicios",
      start: "top 78%",
    },
    y: 40,
    opacity: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: "power2.out",
  });

  gsap.from(".info-block", {
    scrollTrigger: {
      trigger: "#trabajo",
      start: "top 80%",
    },
    y: 32,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: "power2.out",
  });

  gsap.from("#contacto > *", {
    scrollTrigger: {
      trigger: "#contacto",
      start: "top 80%",
    },
    y: 28,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: "power2.out",
  });
}
