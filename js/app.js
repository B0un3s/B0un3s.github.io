// ====== PEAK SCRIPTS — CLEAN STATIC VERSION ======
(() => {
  const root = document.documentElement;
  const btnTheme = document.getElementById('theme-toggle');
  const navbar = document.querySelector('.navbar');
  const scrollbar = document.querySelector('.scrollbar');
  const spot = document.querySelector('.fx-spot');
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Theme ----------
  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }

  // load saved
  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }

  // theme toggle
  btnTheme?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  // ---------- Brand cycle ----------
  const BRANDS = ['sunrise', 'bronze', 'tan', 'uv'];

  function setBrand(name) {
    root.setAttribute('data-brand', name);
    localStorage.setItem('brand', name);
  }

  setBrand(localStorage.getItem('brand') || 'sunrise');

  // hold ALT + click for brand
  btnTheme?.addEventListener('click', (e) => {
    if (e.altKey) {
      const current = root.getAttribute('data-brand');
      const i = BRANDS.indexOf(current);
      setBrand(BRANDS[(i + 1) % BRANDS.length]);
    }
  });

  // ---------- Scrollbar / Navbar ----------
  function onScroll() {
    const y = window.scrollY;

    // navbar shadow
    if (y > 8) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');

    // scroll progress
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? y / max : 0;

    scrollbar.style.transform = `scaleX(${progress})`;
    scrollbar.style.opacity = progress > 0.01 ? '1' : '0';
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Reveal animations ----------
  if (!prefersReduce) {
    const targets = document.querySelectorAll('.reveal');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach((el) => io.observe(el));
  }

  // ---------- Card tilt ----------
  if (!prefersReduce && window.matchMedia('(pointer:fine)').matches) {
    const MAX = 4; // degrees

    document.querySelectorAll('.card').forEach((card) => {
      let rafId = null;

      function move(e) {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;

        const rx = (0.5 - y) * MAX;
        const ry = (x - 0.5) * MAX;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      }

      function leave() {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = '';
      }

      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
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
  });

  // ---------- Spotlight (cursor glow) ----------
  if (!prefersReduce && spot && window.matchMedia('(pointer:fine)').matches) {
    document.addEventListener(
      'pointermove',
      (e) => {
        spot.style.setProperty('--mx', e.clientX + 'px');
        spot.style.setProperty('--my', e.clientY + 'px');
      },
      { passive: true }
    );
  }

})();
