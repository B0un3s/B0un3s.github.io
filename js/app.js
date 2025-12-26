// ====== PEAK SCRIPTS — Solárium Hranice (FULL FIX) ======
(() => {
  const root = document.documentElement;
  const btnTheme = document.getElementById('theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const navbar = document.querySelector('.navbar');
  const scrollbar = document.querySelector('.scrollbar');
  const spot = document.querySelector('.fx-spot');
  const prefersReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  // ---------- Prevent FX overlays from blocking clicks + keep chat on top ----------
  (function injectFixStyles() {
    const id = 'peak-fix-clicks';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .fx-spot, .scrollbar, .ripple { pointer-events:none !important; }
      #chat-widget { z-index:2147483000 !important; pointer-events:auto !important; }
      #chat-fab, #chat-panel, #chat-close, #chat-form, #chat-input { pointer-events:auto !important; }
    `;
    document.head.appendChild(style);
  })();

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
  setBrand(localStorage.getItem('brand') || 'sunrise');

  function cycleBrand() {
    const current = root.getAttribute('data-brand');
    const i = BRANDS.indexOf(current);
    setBrand(BRANDS[(i + 1) % BRANDS.length]);
  }

  btnTheme?.addEventListener('click', (e) => {
    if (e.altKey) return cycleBrand();
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

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
      entries.forEach((en) => {
        if (en.isIntersecting) setActive(en.target.id);
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
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            ioRev.unobserve(en.target);
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
  // ============================== CHAT ================================
  // =====================================================================
  const chatWidget = document.getElementById('chat-widget');
  const chatFab = document.getElementById('chat-fab');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatBox = document.getElementById('chat-box');

  if (chatWidget && chatFab && chatPanel) {
    if (!chatWidget.hasAttribute('data-open')) chatWidget.setAttribute('data-open', '0');

    function isOpen() {
      return chatWidget.getAttribute('data-open') === '1';
    }

    function setOpen(open) {
      chatWidget.setAttribute('data-open', open ? '1' : '0');
      chatPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
      chatFab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && chatInput) setTimeout(() => chatInput.focus(), prefersReduce ? 0 : 60);
    }

    function addMsg(text, mine = false) {
      if (!chatBox) return;
      const row = document.createElement('div');
      row.className = 'chat-msg';

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble' + (mine ? ' me' : '');
      bubble.textContent = text;

      row.appendChild(bubble);
      chatBox.appendChild(row);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    if (chatBox && chatBox.childElementCount === 0) {
      addMsg('Dobrý den, jsem Katka. Napište „ceník“, „objednání“ nebo „kolik minut“.', false);
    }

    // FAB toggle
    chatFab.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!isOpen());
    });

    // close button
    chatClose?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    });

    // click outside closes
    document.addEventListener(
      'pointerdown',
      (e) => {
        if (!isOpen()) return;
        const t = e.target;
        if (!(t instanceof Element)) return;
        if (chatWidget.contains(t)) return;
        setOpen(false);
      },
      { passive: true }
    );

    // ESC closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });

    // send
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = (chatInput?.value || '').trim();
      if (!text) return;

      addMsg(text, true);
      if (chatInput) chatInput.value = '';

      const t = text.toLowerCase();
      setTimeout(() => {
        if (t.includes('cen')) {
          addMsg('Ceník najdete v sekci „Ceník“. Pokud chcete, napište, zda máte zájem o solárium ve stoje nebo vleže.', false);
        } else if (t.includes('obj') || t.includes('rez') || t.includes('term')) {
          addMsg('Pro objednání prosím zavolejte na +420 736 701 777. Rádi vám doporučíme i vhodný počet minut.', false);
        } else if (t.includes('min') || t.includes('kolik') || t.includes('fototyp')) {
          addMsg('Napište prosím fototyp (I–VI) a zda jste letos solárium již navštívili. Doporučím vhodný počet minut.', false);
        } else {
          addMsg('Děkuji. Můžete napsat „ceník“, „objednání“ nebo „kolik minut“.', false);
        }
      }, prefersReduce ? 0 : 180);
    });

    // initial ARIA sync
    setOpen(isOpen());
  }
})();
