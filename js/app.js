// ====== PEAK SCRIPTS — Solárium Hranice (WITH CHAT FIX) ======
(() => {
  const root = document.documentElement;
  const btnTheme = document.getElementById('theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const navbar = document.querySelector('.navbar');
  const scrollbar = document.querySelector('.scrollbar');
  const spot = document.querySelector('.fx-spot');
  const prefersReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  // ---------- FIX: Inject CSS to prevent overlays blocking clicks ----------
  function injectFixStyles() {
    const id = 'peak-fix-noclick-overlay';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      /* FX vrstvy nesmí blokovat klikání */
      .fx-spot, .scrollbar, .ripple { pointer-events: none !important; }

      /* Chat widget musí být vždy navrchu a klikací */
      #chat-widget { pointer-events: auto !important; position: fixed !important; z-index: 2147483000 !important; }
      #chat-fab, #chat-panel, #chat-close, #chat-form, #chat-input { pointer-events: auto !important; }
    `;
    document.head.appendChild(style);
  }
  injectFixStyles();

  // Extra jistota i inline (kdyby někdo přepisoval CSS)
  if (spot) spot.style.pointerEvents = 'none';
  if (scrollbar) scrollbar.style.pointerEvents = 'none';

  // ---------- Theme ----------
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    metaTheme?.setAttribute('content', t === 'dark' ? '#0b0e13' : '#ffffff');
    localStorage.setItem('theme', t);
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) setTheme(savedTheme);
  else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) setTheme('dark');
  else setTheme('light');

  // ---------- Brand cycle ----------
  const BRANDS = ['sunrise', 'bronze', 'tan', 'uv'];
  function setBrand(name) {
    root.setAttribute('data-brand', name);
    localStorage.setItem('brand', name);
  }

  const savedBrand = localStorage.getItem('brand') || 'sunrise';
  setBrand(savedBrand);

  function cycleBrand() {
    const current = root.getAttribute('data-brand');
    const i = BRANDS.indexOf(current);
    const next = (i + 1) % BRANDS.length;
    setBrand(BRANDS[next]);
  }

  // Theme button
  btnTheme?.addEventListener('click', (e) => {
    if (e.altKey) return cycleBrand();
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  // Shortcut B = change brand
  document.addEventListener('keydown', (e) => {
    if ((e.key || '').toLowerCase() === 'b') cycleBrand();
  });

  // ---------- Navbar shadow + Scroll progress ----------
  function onScroll() {
    const y = window.scrollY || 0;

    if (y > 8) navbar?.classList.add('is-scrolled');
    else navbar?.classList.remove('is-scrolled');

    if (scrollbar) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? y / max : 0;
      scrollbar.style.transform = `scaleX(${p})`;
      scrollbar.style.opacity = p > 0.01 ? '1' : '0';
    }
  }
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  // ---------- Active nav by section ----------
  const sections = [...document.querySelectorAll('section[id]')];
  const links = [...document.querySelectorAll('.nav a')];

  function setActive(id) {
    links.forEach((a) =>
      a.classList.toggle('active', (a.getAttribute('href') || '') === `#${id}`)
    );
  }

  const ioNav = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
  );
  sections.forEach((s) => ioNav.observe(s));

  // ---------- Reveal animations ----------
  if (!prefersReduce) {
    const revTargets = [...document.querySelectorAll('.reveal')];
    const ioRev = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            ioRev.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
    );
    revTargets.forEach((el) => ioRev.observe(el));
  }

  // ---------- Tilt on cards ----------
  if (!prefersReduce && matchMedia('(pointer:fine)').matches) {
    const MAX = 4;
    const cards = [...document.querySelectorAll('.card')];

    cards.forEach((card) => {
      let raf = null;

      function move(e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rx = (0.5 - y) * MAX;
        const ry = (x - 0.5) * MAX;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      }

      function leave() {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      }

      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
    });
  }

  // ---------- Ripple on buttons ----------
  document.addEventListener(
    'click',
    (e) => {
      const btn = e.target.closest('.btn');
      if (!btn || prefersReduce) return;

      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.pointerEvents = 'none';

      const rect = btn.getBoundingClientRect();
      r.style.setProperty('--x', `${e.clientX - rect.left}px`);
      r.style.setProperty('--y', `${e.clientY - rect.top}px`);

      btn.appendChild(r);
      setTimeout(() => r.remove(), 650);
    },
    { passive: true }
  );

  // ---------- Spotlight ----------
  if (spot && matchMedia('(pointer:fine)').matches && !prefersReduce) {
    spot.style.pointerEvents = 'none';
    addEventListener(
      'pointermove',
      (e) => {
        spot.style.setProperty('--mx', `${e.clientX}px`);
        spot.style.setProperty('--my', `${e.clientY}px`);
      },
      { passive: true }
    );
  }

  // =====================================================================
  // ============================ CHAT FIX ===============================
  // =====================================================================
  const chatWidget = document.getElementById('chat-widget');
  const chatFab = document.getElementById('chat-fab');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatBox = document.getElementById('chat-box');

  if (chatWidget && chatFab && chatPanel) {
    // default state
    if (!chatWidget.hasAttribute('data-open')) chatWidget.setAttribute('data-open', '0');
    chatPanel.setAttribute('aria-hidden', chatWidget.getAttribute('data-open') === '1' ? 'false' : 'true');
    chatFab.setAttribute('aria-expanded', chatWidget.getAttribute('data-open') === '1' ? 'true' : 'false');

    function setChatOpen(open) {
      chatWidget.setAttribute('data-open', open ? '1' : '0');
      chatPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
      chatFab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && chatInput) setTimeout(() => chatInput.focus(), prefersReduce ? 0 : 80);
    }

    function toggleChat() {
      const open = chatWidget.getAttribute('data-open') === '1';
      setChatOpen(!open);
    }

    function addMsg(text, mine = false) {
      if (!chatBox) return;
      const wrap = document.createElement('div');
      wrap.className = 'chat-msg';

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble' + (mine ? ' me' : '');
      bubble.textContent = text;

      wrap.appendChild(bubble);
      chatBox.appendChild(wrap);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Open/close
    chatFab.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
    });

    chatClose?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setChatOpen(false);
    });

    // Click outside closes (when open)
    document.addEventListener(
      'pointerdown',
      (e) => {
        if (chatWidget.getAttribute('data-open') !== '1') return;
        const t = e.target;
        if (!(t instanceof Element)) return;
        if (chatWidget.contains(t)) return;
        setChatOpen(false);
      },
      { passive: true }
    );

    // ESC closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setChatOpen(false);
    });

    // Send message
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = (chatInput?.value || '').trim();
      if (!text) return;

      addMsg(text, true);
      if (chatInput) chatInput.value = '';

      // placeholder reply (bez backendu)
      setTimeout(() => {
        addMsg('Ahoj, jsem Katka. Napiš prosím: "ceník", "objednání", nebo "kolik minut".', false);
      }, prefersReduce ? 0 : 220);
    });

    // optional: greet once
    if (chatBox && chatBox.childElementCount === 0) {
      addMsg('Ahoj, jsem Katka. S čím pomoct?', false);
    }
  } else {
    // nech to tichý, jen debug pokud bys chtěl:
    // console.warn('[chat] Missing elements - check ids: chat-widget, chat-fab, chat-panel...');
  }
})();
