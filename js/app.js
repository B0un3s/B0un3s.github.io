/* =========================================================
   Solárium Hranice — app.js
   Theme, navbar, reveal, tabs, contact bar, chat assistant
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  // Preferences remain in memory only; the site does not write browser storage.

  const safe = (name, fn) => {
    try { fn(); } catch (err) { console.error(`[app:${name}]`, err); }
  };

  /* ---------- THEME ---------- */
  function initTheme() {
    const btn = $('#theme-toggle');
    const meta = $('meta[name="theme-color"]');
    const icon = btn && $('use', btn);

    const apply = (t) => {
      root.setAttribute('data-theme', t);
      if (meta) meta.setAttribute('content', t === 'dark' ? '#0b0e13' : '#ffffff');
      if (icon) icon.setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
      if (btn) {
        btn.setAttribute('aria-pressed', String(t === 'dark'));
        btn.setAttribute('aria-label', t === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim');
      }
    };

    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    btn?.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
    });
  }

  /* ---------- NAVBAR + SCROLL PROGRESS ---------- */
  function initScroll() {
    const navbar = $('.navbar');
    const bar = $('.scrollbar');
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY || 0;
      navbar?.classList.toggle('is-scrolled', y > 8);
      if (bar) {
        const max = root.scrollHeight - root.clientHeight;
        const p = max > 0 ? clamp(y / max, 0, 1) : 0;
        bar.style.transform = `scaleX(${p})`;
        bar.style.opacity = p > 0.01 ? '1' : '0';
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
  }

  /* ---------- ACTIVE NAV LINK ---------- */
  function initActiveNav() {
    const links = $$('.nav a');
    const sections = links
      .map((a) => $(a.getAttribute('href')))
      .filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const setActive = (id) => links.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });

    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e) => setActive(e.target.id));
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => io.observe(s));
  }

  /* ---------- REVEAL ---------- */
  function initReveal() {
    const targets = $$('.reveal');
    if (!targets.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- BUTTON RIPPLE ---------- */
  function initRipple() {
    if (reduceMotion) return;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest?.('.btn');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.setProperty('--x', `${e.clientX - rect.left}px`);
      r.style.setProperty('--y', `${e.clientY - rect.top}px`);
      btn.appendChild(r);
      setTimeout(() => r.remove(), 650);
    }, { passive: true });
  }

  /* ---------- CURSOR SPOTLIGHT ---------- */
  function initSpotlight() {
    const spot = $('.fx-spot');
    if (!spot || reduceMotion || !finePointer) return;
    let raf = 0, x = innerWidth / 2, y = 120;
    addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        spot.style.setProperty('--mx', `${x}px`);
        spot.style.setProperty('--my', `${y}px`);
      });
    }, { passive: true });
  }

  /* ---------- FIRMY TABS + CONTACT BAR ---------- */
  function initTabsAndContact() {
    const tabs = $$('.tab[data-tab]');
    if (!tabs.length) return;

    const keys = tabs.map((t) => t.dataset.tab);
    const storageKey = 'sh_firmy_tab';

    // Contact quick bar (data comes from the tab markup, single source of truth)
    const chip = $('#cq-chip'), num = $('#cq-num'), call = $('#cq-call'), callLabel = $('#cq-call-label');
    const syncContact = (tab) => {
      const item = tab.closest('.tab-item');
      const link = $('.tab-num', item);
      if (!link || !chip || !num || !call) return;
      const name = item.dataset.name || tab.textContent.trim();
      chip.textContent = name;
      num.textContent = link.textContent.trim();
      call.setAttribute('href', link.getAttribute('href'));
      if (callLabel) callLabel.textContent = `Zavolat: ${name}`;
    };

    const activate = (key, { focus = false, persist = true } = {}) => {
      if (!keys.includes(key)) key = keys[0];
      tabs.forEach((t) => {
        const on = t.dataset.tab === key;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.closest('.tab-item')?.classList.toggle('is-active', on);
        const panel = $(`#panel-${t.dataset.tab}`);
        if (panel) { panel.hidden = !on; panel.classList.toggle('is-active', on); }
        if (on) { syncContact(t); if (focus) t.focus(); }
      });
    };

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => activate(t.dataset.tab));
      t.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        activate(tabs[next].dataset.tab, { focus: true });
      });
    });

    // Initial tab: ?tab=… in URL, then remembered choice, then first
    const fromUrl = (new URLSearchParams(location.search).get('tab') || '').toLowerCase();
    activate(keys.includes(fromUrl) ? fromUrl : keys[0], { persist: false });

    // Contact list toggle
    const toggle = $('#kontakt-toggle');
    const panel = $('#kontakt-panel');
    toggle?.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Skrýt kontakty' : 'Zobrazit všechny kontakty';
    });
  }

  /* ---------- CHAT ASSISTANT ---------- */
  function initChat() {
    const widget = $('#chat-widget');
    const fab = $('#chat-fab');
    const closeBtn = $('#chat-close');
    const form = $('#chat-form');
    const input = $('#chat-input');
    const box = $('#chat-box');
    const chips = $('#chat-chips');
    if (!widget || !fab || !box) return;

    const isOpen = () => widget.dataset.open === '1';
    const setOpen = (open) => {
      widget.dataset.open = open ? '1' : '0';
      fab.setAttribute('aria-expanded', String(open));
      if (open) setTimeout(() => input?.focus(), reduceMotion ? 0 : 80);
    };

    const addMsg = (text, mine = false) => {
      const row = document.createElement('div');
      row.className = 'chat-msg';
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble${mine ? ' me' : ''}`;
      bubble.textContent = text;
      row.appendChild(bubble);
      box.appendChild(row);
      box.scrollTop = box.scrollHeight;
    };

    const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const has = (t, words) => words.some((w) => t.includes(w));

    const reply = (raw) => {
      const t = norm(raw);
      if (has(t, ['cen', 'kc', 'plati', 'stoji'])) {
        return 'Horizontální solárium: 19 Kč/min, 100 minut za 1 370 Kč.\nVertikální solárium: 18 Kč/min, 100 minut za 1 370 Kč.';
      }
      if (has(t, ['obj', 'rezerv', 'termin', 'volat', 'telefon', 'kontakt'])) {
        return 'Objednání do solária není nutné, ale před návštěvou doporučujeme zavolat na +420 736 701 777. Informace o kadeřnictví, kosmetice a masážích najdete v přehledu služeb na této stránce.';
      }
      if (has(t, ['min', 'kolik', 'fototyp', 'opal', 'doba'])) {
        return 'Čas opalování závisí na fototypu a stavu pokožky. Začínáme opatrně a konkrétní čas vám doporučíme přímo na místě.';
      }
      if (has(t, ['adres', 'kde', 'koloseum', 'najd', 'mapa'])) {
        return 'Koloseum, Tř. 1. máje 1901, 753 01 Hranice.';
      }
      if (has(t, ['mail', 'email'])) return 'E-mail: solariumhranice@gmail.com';
      if (has(t, ['ahoj', 'dobry', 'cau', 'hello'])) return 'Dobrý den! S čím vám mohu pomoci?';
      return 'Tomu bohužel nerozumím. Zkuste vybrat jedno z témat níže, nebo zavolejte na +420 736 701 777.';
    };

    const ask = (text) => {
      addMsg(text, true);
      setTimeout(() => addMsg(reply(text)), reduceMotion ? 0 : 200);
    };

    addMsg('Dobrý den, jsem automatický asistent. Vyberte téma níže nebo napište svůj dotaz.');

    fab.addEventListener('click', () => setOpen(!isOpen()));
    closeBtn?.addEventListener('click', () => { setOpen(false); fab.focus(); });

    document.addEventListener('pointerdown', (e) => {
      if (isOpen() && !widget.contains(e.target)) setOpen(false);
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); fab.focus(); }
    });

    chips?.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-q]');
      if (chip) ask(chip.dataset.q);
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = (input.value || '').trim();
      if (!text) return;
      input.value = '';
      ask(text);
    });
  }

  /* ---------- BOOT ---------- */
  const boot = () => {
    safe('theme', initTheme);
    safe('scroll', initScroll);
    safe('activeNav', initActiveNav);
    safe('reveal', initReveal);
    safe('ripple', initRipple);
    safe('spotlight', initSpotlight);
    safe('tabs', initTabsAndContact);
    safe('chat', initChat);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
