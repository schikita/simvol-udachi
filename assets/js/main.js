/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- sticky header ---------- */
const header = $("[data-header]");
function updateHeader() {
  const y = window.scrollY || 0;
  header?.classList.toggle("is-sticky", y > 30);
}
addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* ---------- reveal animations ---------- */
const revealEls = $$("[data-reveal]");
const revealIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("is-revealed");
      revealIO.unobserve(e.target);
    }
  },
  { threshold: 0.16 }
);
revealEls.forEach((el) => revealIO.observe(el));

/* ---------- counters ---------- */
function animateCount(el, to) {
  const start = performance.now();
  const from = 0;
  const dur = 1100;

  const tick = (t) => {
    const p = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(from + (to - from) * eased);
    el.textContent = `${val}+`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const countEls = $$("[data-count]");
const countIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const to = Number(el.getAttribute("data-count") || "0");
      animateCount(el, to);
      countIO.unobserve(el);
    }
  },
  { threshold: 0.35 }
);
countEls.forEach((el) => countIO.observe(el));

/* ---------- mobile sheet ---------- */
const sheet = $("[data-sheet]");
const burger = $("[data-burger]");
const closeBtn = $("[data-close]");
const sheetLinks = $$("[data-sheet-link]");

function openSheet() {
  sheet.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeSheet() {
  sheet.hidden = true;
  document.body.style.overflow = "";
}

burger?.addEventListener("click", openSheet);
closeBtn?.addEventListener("click", closeSheet);
sheet?.addEventListener("click", (e) => {
  if (e.target === sheet) closeSheet();
});
sheetLinks.forEach((a) => a.addEventListener("click", closeSheet));

/* ---------- events slider ---------- */
const track = $("[data-slider-track]");
const btnPrev = $("[data-prev]");
const btnNext = $("[data-next]");

const titles = [
  "Полуфинальный выезд",
  "Контрольная тренировка",
  "Боёвое поле: старт сезона",
];
const descs = [
  "«Боёвое поле» — место, где лошадь и наездник перестают быть «двумя», становясь одной системой.",
  "Ритм, сбор, внимание к мелочи. В тренировке закладывается спокойствие зачета.",
  "После сигнала исчезают эмоции. Остается техника и доверие.",
];

const titleEl = $("[data-slider-title]");
const descEl = $("[data-slider-desc]");
let idx = 0;

function applySlide() {
  if (!track) return;
  track.style.transform = `translateX(-${idx * 100}%)`;
  if (titleEl) titleEl.textContent = titles[idx] || titles[0];
  if (descEl) descEl.textContent = descs[idx] || descs[0];
}

btnPrev?.addEventListener("click", () => {
  idx = (idx - 1 + 3) % 3;
  applySlide();
});
btnNext?.addEventListener("click", () => {
  idx = (idx + 1) % 3;
  applySlide();
});
applySlide();

/* ---------- demo form ---------- */
const form = $("[data-form]");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = $("button[type='submit']", form);
  if (!btn) return;
  const old = btn.textContent;
  btn.textContent = "Отправлено";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = old;
    btn.disabled = false;
    form.reset();
  }, 1200);
});

/* ---------- hoofprints mouse trail ---------- */
(function initHoofprints() {
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  if (prefersReduced || !finePointer) return;

  const layer = $("[data-hoof-layer]");
  if (!layer) return;

  let last = null; // {x,y}
  let side = 1; // left/right alternating
  const step = 26; // spacing
  const maxOnScreen = 70;

  let pending = null;
  let raf = 0;

  function spawnHoof(x, y, rotDeg) {
    const el = document.createElement("div");
    el.className = "hoof";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--rot", `${rotDeg}deg`);

    layer.appendChild(el);

    // cleanup after animation
    el.addEventListener("animationend", () => el.remove(), { once: true });

    // cap elements
    while (layer.childElementCount > maxOnScreen) {
      layer.firstElementChild?.remove();
    }
  }

  function onMove(e) {
    pending = { x: e.clientX, y: e.clientY };
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    raf = 0;
    if (!pending) return;

    const p = pending;
    pending = null;

    if (!last) {
      last = p;
      return;
    }

    const dx = p.x - last.x;
    const dy = p.y - last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < step) return;

    // normalized direction
    const nx = dx / dist;
    const ny = dy / dist;

    // perpendicular for left/right offset
    const px = -ny;
    const py = nx;

    // place multiple hoofprints along the path
    const count = Math.floor(dist / step);
    for (let i = 1; i <= count; i++) {
      const t = (i * step) / dist;
      let x = last.x + dx * t;
      let y = last.y + dy * t;

      // alternate left/right, small offset
      const offset = 7 * side;
      x += px * offset;
      y += py * offset;
      side *= -1;

      // rotation follows movement + a bit of randomness
      const baseRot = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      const rot = baseRot + (Math.random() * 10 - 5);

      spawnHoof(x, y, rot);
    }

    last = p;
  }

  window.addEventListener("mousemove", onMove, { passive: true });

  // Reset when leaving window
  window.addEventListener("mouseleave", () => {
    last = null;
  });
})();


