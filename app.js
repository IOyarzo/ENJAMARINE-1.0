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
const QUOTE_MAIL = window.ENJAMARINE_MAIL?.toEmail?.trim() || "contacto@enjamarine.com";
const QUOTE_ENDPOINT = "https://api.web3forms.com/submit";
if (window.emailjs && window.ENJAMARINE_MAIL?.emailjs?.publicKey) {
  window.emailjs.init({ publicKey: window.ENJAMARINE_MAIL.emailjs.publicKey });
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button[type=submit]");
  const honey = form.querySelector("[name=_honey]");
  if (honey?.value) return;

  const mailCfg = window.ENJAMARINE_MAIL || {};
  const accessKey = mailCfg.accessKey?.trim();
  const emailjsCfg = mailCfg.emailjs || {};
  const publicKey = emailjsCfg.publicKey?.trim();
  const serviceId = emailjsCfg.serviceId?.trim();
  const templateId = emailjsCfg.templateId?.trim();
  const useEmailJs = Boolean(window.emailjs && publicKey && serviceId && templateId);
  note.hidden = true;
  note.classList.remove("is-error");

  if (!useEmailJs && !accessKey) {
    note.textContent = "Falta configurar el envío. Completa EmailJS en mail-config.js.";
    note.classList.add("is-error");
    note.hidden = false;
    return;
  }

  form.classList.add("is-sending");
  button.disabled = true;
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    if (field.name !== "_honey") field.disabled = true;
  });

  const nombre = form.nombre.value.trim();
  const empresa = form.empresa.value.trim();
  const email = form.email.value.trim();
  const interes = form.interes.value.trim();
  const detalle = form.mensaje.value.trim() || "Sin detalle adicional.";
  const subject = `Nueva solicitud de cotización · ${empresa} · ENJAMARINE.CL`;

  try {
    let ok = false;
    if (useEmailJs) {
      const sent = await window.emailjs.send(
        serviceId,
        templateId,
        {
          to_email: QUOTE_MAIL,
          subject,
          title: subject,
          nombre,
          name: nombre,
          empresa,
          correo: email,
          email,
          servicio: interes,
          detalle,
        },
        { publicKey },
      );
      ok = sent.status === 200;
    } else {
      const response = await fetch(QUOTE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          from_name: "ENJAMARINE.CL",
          subject,
          replyto: email,
          nombre,
          empresa,
          correo: email,
          servicio: interes,
          detalle,
          botcheck: "",
        }),
      });
      const result = await response.json().catch(() => ({}));
      ok = response.ok && result.success === true;
    }
    if (!ok) throw new Error("send-failed");
    note.textContent = "Recibido. Te contactamos a la brevedad.";
    note.hidden = false;
    form.reset();
  } catch (err) {
    const detail = err?.text || err?.message || "";
    note.textContent = `No se pudo enviar. Escríbenos a ${QUOTE_MAIL}`;
    if (detail) note.textContent += ` (${detail})`;
    note.classList.add("is-error");
    note.hidden = false;
  } finally {
    form.classList.remove("is-sending");
    button.disabled = false;
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.disabled = false;
    });
  }
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

  const aboutTiles = gsap.utils.toArray(".about-tile");
  gsap.from(aboutTiles, {
    scrollTrigger: { trigger: ".about", start: "top 82%" },
    y: 36,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out",
  });
  gsap.from(".about-copy p", {
    scrollTrigger: { trigger: ".about-copy", start: "top 88%" },
    y: 16,
    opacity: 0,
    duration: 0.6,
    stagger: 0.12,
    ease: "power2.out",
  });
  gsap.to(".about-quote-line", {
    scrollTrigger: { trigger: ".about-quote", start: "top 90%" },
    scaleX: 1,
    duration: 1.1,
    ease: "power2.out",
  });

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  aboutTiles.forEach((tile) => {
    const glow = tile.querySelector(".about-glow");
    if (!finePointer) return;
    tile.addEventListener("pointermove", (event) => {
      const box = tile.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      if (glow) {
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
      }
      const rx = ((y / box.height) - 0.5) * -7;
      const ry = ((x / box.width) - 0.5) * 9;
      gsap.to(tile, {
        rotateX: rx,
        rotateY: ry,
        y: -6,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
      tile.classList.add("is-hot");
    });
    tile.addEventListener("pointerleave", () => {
      gsap.to(tile, {
        rotateX: 0,
        rotateY: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
      tile.classList.remove("is-hot");
    });
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
