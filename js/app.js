// ===== PEAK SCRIPTS — STATIC VERSION (NO AI, JSON KB) =====
(() => {
  const root = document.documentElement;
  const btnTheme = document.getElementById('theme-toggle');
  const navbar = document.querySelector('.navbar');
  const scrollbar = document.querySelector('.scrollbar');
  const spot = document.querySelector('.fx-spot');
  const prefersReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  // ---------- Theme ----------
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  }
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) setTheme(savedTheme);

  // ---------- Brand ----------
  const BRANDS = ['sunrise', 'bronze', 'tan', 'uv'];
  function setBrand(name) {
    root.setAttribute('data-brand', name);
    localStorage.setItem('brand', name);
  }
  setBrand(localStorage.getItem('brand') || 'sunrise');

  btnTheme?.addEventListener('click', (e) => {
    if (e.altKey) {
      const i = BRANDS.indexOf(root.getAttribute('data-brand'));
      setBrand(BRANDS[(i + 1) % BRANDS.length]);
    } else {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    }
  });

  // ---------- Scrollbar ----------
  function onScroll() {
    const y = window.scrollY;
    if (y > 8) navbar?.classList.add('is-scrolled');
    else navbar?.classList.remove('is-scrolled');

    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? y / max : 0;
    scrollbar.style.transform = `scaleX(${p})`;
    scrollbar.style.opacity = p > 0.01 ? '1' : '0';
  }
  onScroll();
  addEventListener('scroll', onScroll);

  // ---------- Reveal ----------
  if (!prefersReduce) {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    els.forEach(el => io.observe(el));
  }

  // ---------- Tilt ----------
  if (!prefersReduce && matchMedia('(pointer:fine)').matches) {
    const MAX = 4;
    document.querySelectorAll('.card').forEach((card) => {
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (0.5 - y) * MAX;
        const ry = (x - 0.5) * MAX;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = "";
      });
    });
  }

  // ---------- Ripple ----------
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const r = document.createElement('span');
    r.className = "ripple";
    const rect = btn.getBoundingClientRect();
    r.style.setProperty('--x', (e.clientX - rect.left) + "px");
    r.style.setProperty('--y', (e.clientY - rect.top) + "px");
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
  });

  // ---------- Spotlight ----------
  if (spot && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', (e) => {
      spot.style.setProperty('--mx', e.clientX + "px");
      spot.style.setProperty('--my', e.clientY + "px");
    });
  }
})();


// ===== OFFLINE KATKA CHAT – JSON KNOWLEDGEBASE =====
(() => {
  // ----- DOM REFS -----
  const W = document.getElementById("chat-widget");
  const FAB = document.getElementById("chat-fab");
  const PANEL = document.getElementById("chat-panel");
  const CLOSE = document.getElementById("chat-close");
  const BOX = document.getElementById("chat-box");
  const FORM = document.getElementById("chat-form");
  const INPUT = document.getElementById("chat-input");

  let greeted = false;
  let KB = null;

  const GREETING =
    "Dobrý den, jsem Katka – vaše virtuální asistentka 😊 Jak vám mohu pomoci?";

  // ----- LOAD KB -----
  async function loadKB() {
    try {
      const res = await fetch("./frantisek.json", { cache: "no-store" });
      KB = await res.json();
    } catch {
      KB = { default: "Omlouvám se, ale znalosti se nepodařilo načíst.", intents: [] };
    }
  }
  loadKB();

  // ----- HELPERS -----
  function normalize(s) {
    return s
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function contains(text, stem) {
    text = normalize(text);
    stem = normalize(stem);
    return text.includes(stem);
  }

  // ----- MATCH -----
  function matchIntent(text) {
    if (!KB) return "Znalosti se ještě načítají.";

    let best = null;
    let score = -1;

    for (const intent of KB.intents) {
      let s = 0;

      // ALL
      if (intent.all && !intent.all.every(st => contains(text, st))) continue;

      // ANY
      if (intent.any) {
        const hits = intent.any.filter(st => contains(text, st)).length;
        if (hits === 0) continue;
        s += hits;
      }

      // PHRASES
      if (intent.phrases) {
        for (const ph of intent.phrases)
          if (contains(text, ph)) s += 2;
      }

      if (s > score) {
        score = s;
        best = intent.answer;
      }
    }

    return best || KB.default || "Nerozumím dotazu.";
  }

  // ----- CHAT OUTPUT -----
  function appendMe(msg) {
    BOX.insertAdjacentHTML("beforeend",
      `<div class="chat-msg"><div class="chat-bubble me">${msg}</div></div>`
    );
  }

  function appendKatka(msg) {
    BOX.insertAdjacentHTML("beforeend",
      `<div class="chat-msg"><div class="chat-bubble">${msg}</div></div>`
    );
  }

  // ----- OPEN / CLOSE -----
  FAB.addEventListener("click", () => {
    W.setAttribute("data-open", "1");
    if (!greeted) {
      greeted = true;
      appendKatka(GREETING);
    }
  });

  CLOSE.addEventListener("click", () => {
    W.removeAttribute("data-open");
  });

  // ----- SUBMIT -----
  FORM.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = INPUT.value.trim();
    if (!msg) return;

    appendMe(msg);
    INPUT.value = "";

    const reply = matchIntent(msg);
    appendKatka(reply);
  });
})();
