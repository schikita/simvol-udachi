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

const titles = [];

const descs = [
  "В конюшне стоят лошади, бережно укрытые попонами вроде пледов. Трижды в день – овес с сеном. А еще душ с шампунем и даже солярий – чтобы расслабились мышцы после тренировок.",
  "Конюх Наталья Михолапова вычищает денники и устилает пол чистыми опилками. Наталья Ивановна уже более десяти лет заботится о лошадях. Признается, что это была любовь с первого взгляда и притом взаимная:",  
];

const texts = [
  `
    <p>
      Когда видишь, как лошадь до седьмого пота работает на манеже, понимаешь, что такой уход – вовсе не роскошь. Это те же спортсмены: они должны быть в идеальной физической форме.
    </p>    
  `,
  `
    <p>
      – Когда я утром захожу в конюшню, чтобы покормить, они меня уже по шагам узнают и встречают дружеским ржанием. Мои любимцы – Ватикан и Викинг -- они здесь уже давно, как и я. Питание у них трехразовое: сено, овес, морковь, витамины, мюсли.
    </p>
  
  `
];

const titleEl = $("[data-slider-title]");
const descEl = $("[data-slider-desc]");
const textEl = $("[data-slider-text]");

let idx = 0;
const slidesCount = texts.length;

function applySlide() {
  if (!track) return;

  track.style.transform = `translateX(-${idx * 100}%)`;

  if (titleEl) titleEl.textContent = titles[idx];
  if (descEl) descEl.textContent = descs[idx];
  if (textEl) textEl.innerHTML = texts[idx];
}

btnPrev?.addEventListener("click", () => {
  idx = (idx - 1 + slidesCount) % slidesCount;
  applySlide();
});

btnNext?.addEventListener("click", () => {
  idx = (idx + 1) % slidesCount;
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

  let last = null;
  let side = 1;
  const step = 26;
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

    el.addEventListener("animationend", () => el.remove(), { once: true });

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

    const nx = dx / dist;
    const ny = dy / dist;

    const px = -ny;
    const py = nx;

    const count = Math.floor(dist / step);
    for (let i = 1; i <= count; i++) {
      const t = (i * step) / dist;
      let x = last.x + dx * t;
      let y = last.y + dy * t;

      const offset = 7 * side;
      x += px * offset;
      y += py * offset;
      side *= -1;

      const baseRot = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      const rot = baseRot + (Math.random() * 10 - 5);

      spawnHoof(x, y, rot);
    }

    last = p;
  }

  window.addEventListener("mousemove", onMove, { passive: true });

  window.addEventListener("mouseleave", () => {
    last = null;
  });
})();

// ========== PROJECTS CAROUSEL ==========
function initProjectsCarousel() {
  const viewport = document.querySelector(".projects-viewport");
  if (!viewport) return;

  const stage = viewport.querySelector(".projects-stage");
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll(".project-card"));
  if (!cards.length) return;

  const dotsWrap = viewport.querySelector(".pr-dots");
  const prevBtn = viewport.querySelector(".prev");
  const nextBtn = viewport.querySelector(".next");
  if (!dotsWrap) return;

  let i = 0;
  let timer = null;

  const interval = +(viewport.dataset.interval || 5000);
  const autoplay = viewport.dataset.autoplay !== "false";
  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  dotsWrap.innerHTML = cards.map(() => "<i></i>").join("");
  const dots = Array.from(dotsWrap.children);

  const show = (idx) => {
    i = (idx + cards.length) % cards.length;
    cards.forEach((c, k) => c.classList.toggle("is-active", k === i));
    dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
  };

  const next = () => show(i + 1);
  const prev = () => show(i - 1);

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const play = () => {
    if (reduce || !autoplay) return;
    stop();
    timer = setInterval(next, interval);
  };

  show(0);
  play();

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      next();
      play();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prev();
      play();
    });
  }

  dotsWrap.addEventListener("click", (e) => {
    const idx = dots.indexOf(e.target);
    if (idx > -1) {
      show(idx);
      play();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProjectsCarousel);
} else {
  initProjectsCarousel();
}

/* ===== REVEAL (IntersectionObserver) ===== */
(() => {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((el) => io.observe(el));
})();

/* ===== QUOTE SLIDER ===== */
(() => {
  const slider = document.querySelector(".js-quote-slider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".bigQuote__slide"));
  const dots = Array.from(slider.querySelectorAll(".js-quote-dots span"));

  if (slides.length !== dots.length) return;

  let current = 0;

  const show = (index) => {
    current = index;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === current));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => show(i));
  });

  show(0);
})();

/* ===== PHOTO MODAL ===== */
(() => {
  const modal = document.getElementById("photoModal");
  const img = modal?.querySelector(".photoModal__img");
  const backdrop = modal?.querySelector(".photoModal__backdrop");

  if (!modal || !img || !backdrop) return;

  const gallery = document.querySelectorAll(".photoGrid__grid img");

  gallery.forEach((photo) => {
    photo.addEventListener("click", () => {
      img.src = photo.src;
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  });

  const closeModal = () => {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  backdrop?.addEventListener("click", closeModal);
  img?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
})();

// ===== PRELOADER ANIMATION =====

(function initPreloader() {
  // Анимированные точки загрузки
  function initDotsAnimation() {
    const dotsElement = document.getElementById("dots");
    if (!dotsElement) return;

    let dotCount = 1;
    setInterval(() => {
      dotCount = (dotCount % 3) + 1;
      dotsElement.textContent = ".".repeat(dotCount);
    }, 500);
  }

  // Анимация кадров
  function initFrameAnimation() {
    const frames = document.querySelectorAll(".frame");
    if (frames.length === 0) return;

    let currentFrame = 0;
    const totalFrames = frames.length;
    const fps = 12; // Кадров в секунду

    function animateFrames() {
      frames.forEach((frame) => {
        frame.classList.remove("active");
      });

      frames[currentFrame].classList.add("active");
      currentFrame = (currentFrame + 1) % totalFrames;
    }

    // Первый кадр сразу
    animateFrames();

    // Остальные кадры по интервалу
    setInterval(animateFrames, 1000 / fps);
  }

  // Создание партиклей на фоне
  function createParticles() {
    const container = document.getElementById("particles");
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      const size = Math.random() * 2 + 1;
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.background = ["#10b981", "#0ea5e9", "#ffffff"][
        Math.floor(Math.random() * 3)
      ];
      particle.style.borderRadius = "50%";
      particle.style.opacity = Math.random() * 0.5 + 0.2;

      const duration = Math.random() * 10 + 15;
      const offset = Math.random() * 200 - 100;
      particle.style.animation = `floatParticle ${duration}s linear infinite`;
      particle.style.setProperty("--offset", offset + "px");

      container.appendChild(particle);
    }
  }

  // Скрытие прелоадера после загрузки
  function hidePreloader() {
    const preloader = document.querySelector(".preloader");
    if (!preloader) return;

    // Скрываем с анимацией
    preloader.style.opacity = "0";
    preloader.style.visibility = "hidden";
    preloader.style.pointerEvents = "none";

    // После анимации можно удалить из DOM (опционально)
    setTimeout(() => {
      preloader.style.display = "none";
    }, 600);
  }

  // Инициализация
  function init() {
    initDotsAnimation();
    initFrameAnimation();
    createParticles();

    // Скрыть прелоадер через 2.5 секунды или когда загрузится страница (смотря что первым)
    const hideTimer = setTimeout(hidePreloader, 2500);

    if (document.readyState === "loading") {
      window.addEventListener("load", () => {
        clearTimeout(hideTimer);
        hidePreloader();
      });
    }
  }

  // Запустить инициализацию
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
