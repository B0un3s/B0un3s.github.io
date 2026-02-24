/* =========================
   app.js — PEAK JS v2
   + tabs with phone numbers inside
   + smart calling numbers
   + compact contact panel
   ========================= */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const state = {
    root: document.documentElement,
    prefersReduce: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
    pointerFine: window.matchMedia?.('(pointer:fine)')?.matches ?? false,
  };

  function safe(name, fn) {
    try { fn(); }
    catch (err) { console.error(`[PEAK:${name}]`, err); }
  }

  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else fn();
  };

  function injectFixStyles() {
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
  }

  // THEME + BRAND
  function ThemeBrand() {
    const btnTheme = $('#theme-toggle');
    const metaTheme = $('meta[name="theme-color"]');
    const BRANDS = ['sunrise', 'bronze', 'tan', 'uv'];

    const setTheme = (t) => {
      state.root.setAttribute('data-theme', t);
      if (metaTheme) metaTheme.setAttribute('content', t === 'dark' ? '#0b0e13' : '#ffffff');
      try { localStorage.setItem('theme', t); } catch {}
    };
    const getTheme = () => state.root.getAttribute('data-theme') || 'light';

    const setBrand = (b) => {
      state.root.setAttribute('data-brand', b);
      try { localStorage.setItem('brand', b); } catch {}
    };
    const getBrand = () => state.root.getAttribute('data-brand') || 'sunrise';

    const cycleBrand = () => {
      const cur = getBrand();
      const i = BRANDS.indexOf(cur);
      const next = BRANDS[(i + 1 + BRANDS.length) % BRANDS.length];
      setBrand(next);
    };

    safe('theme:init', () => {
      let saved = null;
      try { saved = localStorage.getItem('theme'); } catch {}
      if (saved === 'dark' || saved === 'light') setTheme(saved);
      else if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) setTheme('dark');
      else setTheme('light');
    });

    safe('brand:init', () => {
      let saved = null;
      try { saved = localStorage.getItem('brand'); } catch {}
      setBrand(saved && BRANDS.includes(saved) ? saved : 'sunrise');
    });

    on(btnTheme, 'click', (e) => {
      if (e.altKey) return cycleBrand();
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });

    on(document, 'keydown', (e) => {
      if ((e.key || '').toLowerCase() === 'b') cycleBrand();
    });
  }

  // NAVBAR + SCROLLBAR
  function NavbarScroll() {
    const navbar = $('.navbar');
    const scrollbar = $('.scrollbar');
    if (!navbar && !scrollbar) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY || 0;

      if (navbar) navbar.classList.toggle('is-scrolled', y > 8);

      if (scrollbar) {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const p = max > 0 ? clamp(y / max, 0, 1) : 0;
        scrollbar.style.transform = `scaleX(${p})`;
        scrollbar.style.opacity = p > 0.01 ? '1' : '0';
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
  }

  // ACTIVE NAV
  function ActiveNav() {
    const sections = $$('section[id]');
    const links = $$('.nav a');
    if (!sections.length || !links.length) return;

    const linkById = new Map(
      links
        .map(a => [ (a.getAttribute('href') || '').replace('#',''), a ])
        .filter(([id]) => id)
    );

    const setActive = (id) => {
      links.forEach(a => a.classList.remove('active'));
      const hit = linkById.get(id);
      if (hit) hit.classList.add('active');
    };

    if (!('IntersectionObserver' in window)) {
      setActive(sections[0].id);
      return;
    }

    let current = '';
    const io = new IntersectionObserver((entries) => {
      const best = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => (b.intersectionRatio||0) - (a.intersectionRatio||0))[0];

      const id = best?.target?.id;
      if (id && id !== current) {
        current = id;
        setActive(id);
      }
    }, { rootMargin: '-45% 0px -50% 0px', threshold: [0.01, 0.1, 0.2, 0.35, 0.5] });

    sections.forEach(s => io.observe(s));
  }

  // REVEAL
  function Reveal() {
    const targets = $$('.reveal');
    if (!targets.length) return;

    if (state.prefersReduce || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });

    targets.forEach(el => io.observe(el));
  }

  // RIPPLE (btn + tab)
  function RippleButtons() {
    if (state.prefersReduce) return;

    on(document, 'click', (e) => {
      const hit = e.target?.closest?.('.btn, .tab');
      if (!hit) return;

      // no ripple on phone link inside tabs
      if (e.target?.closest?.('[data-no-tab]')) return;

      const r = document.createElement('span');
      r.className = 'ripple';

      const rect = hit.getBoundingClientRect();
      r.style.setProperty('--x', `${e.clientX - rect.left}px`);
      r.style.setProperty('--y', `${e.clientY - rect.top}px`);

      hit.appendChild(r);
      setTimeout(() => r.remove(), 650);
    }, { passive: true });
  }

  // SPOTLIGHT
  function Spotlight() {
    const spot = $('.fx-spot');
    if (!spot || state.prefersReduce || !state.pointerFine) return;

    let raf = 0;
    let lastX = window.innerWidth * 0.5;
    let lastY = 120;

    const paint = () => {
      raf = 0;
      spot.style.setProperty('--mx', `${lastX}px`);
      spot.style.setProperty('--my', `${lastY}px`);
    };

    addEventListener('pointermove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });

    paint();
  }

  // SMART CALL (numbers)
  const SmartCall = (() => {
    const PHONE = {
      solarium: '+420736701777',
      diana: '+420732612227',
      tereza: '+420776350069',
      lucie: '+420775149228',
    };

    const NAME = {
      solarium: 'Solárium',
      diana: 'Diana',
      tereza: 'Terezie',
      lucie: 'Lucie',
    };

    const telHref = (num) => `tel:${String(num).replace(/\s+/g, '')}`;

    const getActiveService = () => {
      const activeTab = document.querySelector('.tab.is-active[data-tab]');
      const key = (activeTab?.dataset?.tab || 'solarium').toLowerCase();
      return PHONE[key] ? key : 'solarium';
    };

    const updateActiveButton = () => {
      const btn = document.querySelector('[data-call-active]');
      if (!btn) return;
      const key = getActiveService();
      const num = PHONE[key];
      btn.textContent = `📞 Zavolat: ${NAME[key]} (${num.replace('+420', '+420 ')})`;
    };

    const init = () => {
      // Click on specific service call
      on(document, 'click', (e) => {
        const a = e.target?.closest?.('[data-call]');
        if (!a) return;

        const key = (a.getAttribute('data-call') || '').toLowerCase();
        const num = PHONE[key];
        if (!num) return;

        e.preventDefault();
        window.location.href = telHref(num);
      });

      // Call active service
      on(document, 'click', (e) => {
        const a = e.target?.closest?.('[data-call-active]');
        if (!a) return;

        e.preventDefault();
        const key = getActiveService();
        const num = PHONE[key];
        if (!num) return;

        window.location.href = telHref(num);
      });

      updateActiveButton();
    };

    return { init, updateActiveButton };
  })();

  // FIRMY TABS (+ URL + remember)
  function FirmyTabs() {
    const tabs = $$('.tab[data-tab]');
    if (!tabs.length) return;

    const panels = {};
    tabs.forEach((t) => {
      const key = (t.dataset.tab || '').toLowerCase();
      const panel = $(`#panel-${key}`);
      if (key && panel) panels[key] = panel;
    });

    const keys = Object.keys(panels);
    if (!keys.length) return;

    const storageKey = 'sh_firmy_tab';

    const getFromURL = () => {
      try {
        const u = new URL(location.href);
        const q = (u.searchParams.get('tab') || '').toLowerCase();
        if (q && keys.includes(q)) return q;
      } catch {}

      const h = (location.hash || '').replace('#','').toLowerCase();
      if (h && keys.includes(h)) return h;

      try {
        const saved = (localStorage.getItem(storageKey) || '').toLowerCase();
        if (saved && keys.includes(saved)) return saved;
      } catch {}

      return keys[0];
    };

    const syncURL = (key) => {
      try {
        const u = new URL(location.href);
        u.searchParams.set('tab', key);
        const firmy = $('#firmy');
        if (firmy) u.hash = '#firmy';
        history.replaceState(null, '', u.toString());
      } catch {}
    };

    const activate = (key, { updateURL = true } = {}) => {
      if (!keys.includes(key)) key = keys[0];

      tabs.forEach((t) => {
        const onNow = (t.dataset.tab || '').toLowerCase() === key;
        t.classList.toggle('is-active', onNow);
        t.setAttribute('aria-selected', onNow ? 'true' : 'false');
        t.tabIndex = onNow ? 0 : -1;
      });

      keys.forEach((k) => {
        const panel = panels[k];
        const onNow = k === key;
        panel.hidden = !onNow;
        panel.classList.toggle('is-active', onNow);
        panel.setAttribute('aria-hidden', onNow ? 'false' : 'true');
      });

      try { localStorage.setItem(storageKey, key); } catch {}
      if (updateURL) syncURL(key);

      SmartCall.updateActiveButton?.();
    };

    // click on tel number must NOT switch tab
    on(document, 'click', (e) => {
      const tel = e.target?.closest?.('[data-no-tab]');
      if (!tel) return;
      e.stopPropagation();
    });

    tabs.forEach((t) => {
      on(t, 'click', (e) => {
        if (e.target?.closest?.('[data-no-tab]')) return;
        activate((t.dataset.tab || '').toLowerCase(), { updateURL: true });
      });

      on(t, 'keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        activate((t.dataset.tab || '').toLowerCase(), { updateURL: true });
      });
    });

    tabs.forEach((t, idx) => {
      on(t, 'keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = (idx + dir + tabs.length) % tabs.length;
        tabs[next].focus();
        activate((tabs[next].dataset.tab || '').toLowerCase(), { updateURL: true });
      });
    });

    activate(getFromURL(), { updateURL: false });

    on(window, 'popstate', () => activate(getFromURL(), { updateURL: false }));
    on(window, 'hashchange', () => activate(getFromURL(), { updateURL: false }));
  }

  // CONTACT COMPACT (toggle + sync quick bar)
  function ContactCompact() {
    const toggle = document.getElementById('kontakt-toggle');
    const panel = document.getElementById('kontakt-panel');
    const chip = document.getElementById('cq-chip');
    const num = document.getElementById('cq-num');

    if (!toggle || !panel || !chip || !num) return;

    const LABEL = {
      solarium: '☀ Solárium',
      diana: '💇‍♀️ Diana',
      tereza: '✂️ Terezie',
      lucie: '💆‍♀️ Lucie',
    };

    const PHONE = {
      solarium: '+420 736 701 777',
      diana: '+420 732 612 227',
      tereza: '+420 776 350 069',
      lucie: '+420 775 149 228',
    };

    const getActive = () => {
      const t = document.querySelector('.tab.is-active[data-tab]');
      const key = (t?.dataset?.tab || 'solarium').toLowerCase();
      return PHONE[key] ? key : 'solarium';
    };

    const sync = () => {
      const key = getActive();
      chip.textContent = LABEL[key];
      num.textContent = PHONE[key];
    };

    const setOpen = (open) => {
      panel.classList.toggle('contact-open', open);
      panel.classList.toggle('contact-collapsed', !open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '🧾 Skrýt kontakty' : '📇 Zobrazit všechny kontakty';
    };

    setOpen(false);
    sync();

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.contains('contact-open');
      setOpen(!isOpen);
    });

    // sync after tab click
    document.addEventListener('click', (e) => {
      const t = e.target?.closest?.('.tab[data-tab]');
      if (!t) return;
      if (e.target?.closest?.('[data-no-tab]')) return;
      setTimeout(sync, 0);
    });

    window.addEventListener('hashchange', () => setTimeout(sync, 0));
    window.addEventListener('popstate', () => setTimeout(sync, 0));
  }

  // CHAT
  function Chat() {
    const chatWidget = $('#chat-widget');
    const chatFab = $('#chat-fab');
    const chatPanel = $('#chat-panel');
    const chatClose = $('#chat-close');
    const chatForm = $('#chat-form');
    const chatInput = $('#chat-input');
    const chatBox = $('#chat-box');

    if (!chatWidget || !chatFab || !chatPanel) return;

    const storageKey = 'sh_chat_open';

    const getOpen = () => chatWidget.getAttribute('data-open') === '1';
    const setOpen = (open) => {
      chatWidget.setAttribute('data-open', open ? '1' : '0');
      chatPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
      chatFab.setAttribute('aria-expanded', open ? 'true' : 'false');
      try { localStorage.setItem(storageKey, open ? '1' : '0'); } catch {}
      if (open && chatInput) setTimeout(() => chatInput.focus(), state.prefersReduce ? 0 : 60);
    };

    const addMsg = (text, mine = false) => {
      if (!chatBox) return;
      const row = document.createElement('div');
      row.className = 'chat-msg';
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble${mine ? ' me' : ''}`;
      bubble.textContent = text;
      row.appendChild(bubble);
      chatBox.appendChild(row);
      chatBox.scrollTop = chatBox.scrollHeight;
    };

    safe('chat:initOpen', () => {
      if (!chatWidget.hasAttribute('data-open')) chatWidget.setAttribute('data-open', '0');
      let saved = null;
      try { saved = localStorage.getItem(storageKey); } catch {}
      if (saved === '1') setOpen(true);
      else setOpen(getOpen());
    });

    if (chatBox && chatBox.childElementCount === 0) {
      addMsg('Dobrý den, jsem Katka. Napište „ceník“, „objednání“ nebo „kolik minut“.', false);
    }

    on(chatFab, 'click', (e) => { e.preventDefault(); e.stopPropagation(); setOpen(!getOpen()); });
    on(chatClose, 'click', (e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); });

    on(document, 'pointerdown', (e) => {
      if (!getOpen()) return;
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (chatWidget.contains(t)) return;
      setOpen(false);
    }, { passive: true });

    on(document, 'keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    const reply = (inputText) => {
      const t = (inputText || '').toLowerCase();
      if (t.includes('cen')) return 'Ceník je v sekci „Ceník“. Napište prosím: ve stoje / vleže.';
      if (t.includes('obj') || t.includes('rez') || t.includes('term')) return 'Pro objednání zavolejte prosím na příslušnou službu v sekci „Kontakt“.';
      if (t.includes('min') || t.includes('kolik') || t.includes('fototyp')) return 'Napište fototyp (I–VI) a zda jste letos solárium už navštívili. Doporučím minuty.';
      return 'Můžete napsat „ceník“, „objednání“ nebo „kolik minut“.';
    };

    on(chatForm, 'submit', (e) => {
      e.preventDefault();
      const text = (chatInput?.value || '').trim();
      if (!text) return;
      addMsg(text, true);
      if (chatInput) chatInput.value = '';
      const out = reply(text);
      setTimeout(() => addMsg(out, false), state.prefersReduce ? 0 : 180);
    });

    setOpen(getOpen());
  }

  // BOOT
  ready(() => {
    safe('injectFixStyles', injectFixStyles);

    safe('fx:pointerEvents', () => {
      const spot = $('.fx-spot');
      const scrollbar = $('.scrollbar');
      if (spot) spot.style.pointerEvents = 'none';
      if (scrollbar) scrollbar.style.pointerEvents = 'none';
    });

    safe('ThemeBrand', ThemeBrand);
    safe('NavbarScroll', NavbarScroll);
    safe('ActiveNav', ActiveNav);
    safe('Reveal', Reveal);
    safe('RippleButtons', RippleButtons);
    safe('Spotlight', Spotlight);

    safe('SmartCall:init', SmartCall.init);
    safe('FirmyTabs', FirmyTabs);
    safe('ContactCompact', ContactCompact);
    safe('Chat', Chat);
  });
})();
