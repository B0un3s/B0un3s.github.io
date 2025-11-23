// ===== PEAK SCRIPTS — STATIC VERSION (NO AI, NO API) =====
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
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  } else {
    setTheme('light');
  }

  // ---------- Brand ----------
  const BRANDS = ['sunrise', 'bronze', 'tan', 'uv'];
  function setBrand(name) {
    root.setAttribute('data-brand', name);
    localStorage.setItem('brand', name);
  }
  const savedBrand = localStorage.getItem('brand') || 'sunrise';
  setBrand(savedBrand);

  function cycleBrand() {
    const i = BRANDS.indexOf(root.getAttribute('data-brand'));
    const next = BRANDS[(i + 1) % BRANDS.length];
    setBrand(next);
  }

  btnTheme?.addEventListener('click', (e) => {
    if (e.altKey) return cycleBrand();
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  // ---------- Navbar + Scrollbar ----------
  function onScroll() {
    const y = window.scrollY || 0;
    if (y > 8) navbar?.classList.add('is-scrolled');
    else navbar?.classList.remove('is-scrolled');

    if (scrollbar) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? y / max : 0;
      scrollbar.style.transform = `scaleX(${p})`;
      scrollbar.style.opacity = p > 0.01 ? '1' : '0';
    }
  }
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  // ---------- Reveal ----------
  if (!prefersReduce) {
    const items = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach((el) => io.observe(el));
  }

  // ---------- Tilt ----------
  if (!prefersReduce && matchMedia('(pointer:fine)').matches) {
    const MAX = 4;
    document.querySelectorAll('.card').forEach((card) => {
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * MAX;
        const ry = (x - 0.5) * MAX;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
  }

  // ---------- Ripple ----------
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn || prefersReduce) return;
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    r.style.setProperty('--x', `${e.clientX - rect.left}px`);
    r.style.setProperty('--y', `${e.clientY - rect.top}px`);
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
  }, { passive: true });

  // ---------- Spotlight ----------
  if (spot && matchMedia("(pointer:fine)").matches) {
    addEventListener('pointermove', (e) => {
      spot.style.setProperty('--mx', `${e.clientX}px`);
      spot.style.setProperty('--my', `${e.clientY}px`);
    }, { passive: true });
  }
})();


// ===== STATIC CHAT KATKA (NO AI) =====
(() => {
  // ---- DOM Elements ----
  const W = document.getElementById("chat-widget");
  const FAB = document.getElementById("chat-fab");
  const PANEL = document.getElementById("chat-panel");
  const CLOSE = document.getElementById("chat-close");
  const BOX = document.getElementById("chat-box");
  const FORM = document.getElementById("chat-form");
  const INPUT = document.getElementById("chat-input");

  // ---- Welcome ----
  let greeted = false;
  const GREETING =
    "Dobrý den, jsem Katka — virtuální asistentka Solária Hranice 😊 Jak vám mohu pomoci?";

  // ---- Basic Offline Responses ----
  function respondStatic(text) {
    const t = text.toLowerCase();

    if (t.includes("cena") || t.includes("kolik")) {
      return "Ceník: 19 Kč/min vleže a 18 Kč/min ve stoje. 100+20 minut zdarma za 1500 Kč.";
    }

    if (t.includes("otev")) return "Jsme otevřeni každý den 9:00–21:00.";
    if (t.includes("adresa") || t.includes("kde")) return "Najdete nás v Koloseu Hranice.";

    if (t.includes("permanentka")) return "Permanentky máme fyzicky na recepci — 100 minut za 1250 Kč.";

    return "Děkuji za zprávu! Pokud máte konkrétní dotaz, napište mi prosím víc 😊";
  }

  function appendMe(msg) {
    BOX.insertAdjacentHTML(
      "beforeend",
      `<div class="chat-msg"><div class="chat-bubble me">${msg}</div></div>`
    );
  }

  function appendKatka(msg) {
    BOX.insertAdjacentHTML(
      "beforeend",
      `<div class="chat-msg"><div class="chat-bubble">${msg}</div></div>`
    );
  }

  function scrollBottom() {
    BOX.scrollTop = BOX.scrollHeight;
  }

  // ---- Open/Close ----
  FAB.addEventListener("click", () => {
    W.setAttribute("data-open", "1");
    if (!greeted) {
      greeted = true;
      appendKatka(GREETING);
    }
    scrollBottom();
  });

  CLOSE.addEventListener("click", () => {
    W.removeAttribute("data-open");
  });

  // ---- Form submit ----
  FORM.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = INPUT.value.trim();
    if (!msg) return;
    appendMe(msg);
    INPUT.value = "";
    const reply = respondStatic(msg);
    appendKatka(reply);
    scrollBottom();
  });
})();
