// ====== PEAK SCRIPTS — Solárium Hranice ======
(() => {
  const root = document.documentElement;
  const btnTheme = document.getElementById('theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const navbar = document.querySelector('.navbar');
  const scrollbar = document.querySelector('.scrollbar');
  const spot = document.querySelector('.fx-spot');
  const prefersReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  // ---------- Theme ----------
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    metaTheme?.setAttribute('content', t === 'dark' ? '#0b0e13' : '#ffffff');
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

  // ---------- Brand cycle ----------
  const BRANDS = ['sunrise', 'bronze', 'tan', 'uv'];
  function setBrand(name) {
    root.setAttribute('data-brand', name);
    localStorage.setItem('brand', name);
  }
  const savedBrand = localStorage.getItem('brand') || 'sunrise';
  setBrand(savedBrand);
  function cycleBrand() {
    const i = BRANDS.indexOf(root.getAttribute('data-brand')) || 0;
    setBrand(BRANDS[(i + 1) % BRANDS.length]);
  }

  // Theme button
  btnTheme?.addEventListener('click', (e) => {
    if (e.altKey) {
      cycleBrand();
      return;
    }
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  // Key shortcut: B = change brand
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
    const MAX = 4; // deg
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
    addEventListener(
      'pointermove',
      (e) => {
        spot.style.setProperty('--mx', `${e.clientX}px`);
        spot.style.setProperty('--my', `${e.clientY}px`);
      },
      { passive: true }
    );
  }
})();


// ====== CHAT „FRANTIŠEK“ — Messenger bublina + JSON znalostní báze ======
(() => {
  // ---------- Nastavení ----------
  const BOT_NAME = "František";
  const GREETING = "Dobrý den, jmenuji se František. Jsem virtuální asistent Solária Hranice. S čím vám mohu pomoci?";
  // Cesta k databázi Q&A (JSON). Vytvoř soubor /js/frantisek.json
  const KB_URL = "js/frantisek.json";

  // ---------- Injekt CSS (aby to jelo i bez úprav style.css) ----------
  const css = `
  #chat-widget{position:fixed;right:20px;bottom:20px;z-index:10000}
  .chat-fab{
    width:56px;height:56px;border-radius:999px;border:1px solid var(--border);
    display:grid;place-items:center;font-size:22px;cursor:pointer;
    background:linear-gradient(180deg,color-mix(in oklab,var(--surface) 96%,transparent),color-mix(in oklab,var(--surface) 86%,transparent));
    box-shadow:var(--shadow-2);transition:transform .15s,box-shadow .15s,background .15s
  }
  .chat-fab:hover{transform:translateY(-1px)}
  .chat-panel{
    position:absolute;right:0;bottom:72px;width:min(92vw,360px);max-height:70vh;
    display:grid;grid-template-rows:auto 1fr auto;border-radius:var(--radius);
    overflow:hidden;border:1px solid var(--border);background:var(--surface);box-shadow:var(--shadow-2);
    opacity:0;pointer-events:none;transform:translateY(8px) scale(.98);transition:opacity .18s,transform .18s
  }
  #chat-widget[data-open="1"] .chat-panel{opacity:1;pointer-events:auto;transform:translateY(0) scale(1)}
  .chat-header{
    display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center;
    padding:10px 12px;border-bottom:1px solid var(--border);
    background:linear-gradient(180deg,color-mix(in oklab,var(--surface) 96%,transparent),color-mix(in oklab,var(--surface) 88%,transparent))
  }
  .chat-avatar{
    width:36px;height:36px;border-radius:10px;display:grid;place-items:center;font-weight:900;
    background:linear-gradient(180deg,rgb(var(--brand-rgb)/.25),rgb(var(--brand-rgb)/.08));
    box-shadow:0 1px 0 rgba(255,255,255,.06) inset
  }
  .chat-title span{display:block;font-size:12px;color:var(--muted)}
  .chat-box{padding:12px;overflow-y:auto;background:var(--surface-2)}
  .chat-msg{margin:8px 0;display:grid;gap:6px}
  .chat-bubble{
    display:inline-block;padding:8px 10px;border-radius:12px;border:1px solid var(--border);
    background:var(--surface);max-width:85%
  }
  .chat-bubble.me{
    background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 94%,#fff 12%),color-mix(in oklab,var(--accent) 88%,#000 8%));
    color:#111;border-color:transparent;justify-self:end
  }
  .chat-meta{font-size:11px;color:var(--muted)}
  .chat-input-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:10px;border-top:1px solid var(--border);background:var(--surface)}
  #chat-input{height:42px;border-radius:10px;border:1px solid var(--border);padding:0 12px;background:var(--surface-2);color:var(--text)}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- Sestav DOM widget ----------
  const wrap = document.createElement('div');
  wrap.id = 'chat-widget';
  wrap.innerHTML = `
    <button id="chat-fab" class="chat-fab" aria-label="Otevřít chat s ${BOT_NAME}" aria-expanded="false">💬</button>
    <section id="chat-panel" class="chat-panel card glass" aria-hidden="true" role="dialog" aria-label="Chat s ${BOT_NAME}">
      <header class="chat-header">
        <div class="chat-avatar">F</div>
        <div class="chat-title"><strong>${BOT_NAME}</strong><span>Virtuální asistent</span></div>
        <button id="chat-close" class="btn btn-icon" aria-label="Zavřít chat">✕</button>
      </header>
      <div id="chat-box" class="chat-box"></div>
      <form id="chat-form" class="chat-input-row" autocomplete="off">
        <input id="chat-input" type="text" placeholder="Napiš zprávu…" aria-label="Zpráva pro ${BOT_NAME}" />
        <button type="submit" class="btn btn-primary btn-sheen">Odeslat</button>
      </form>
    </section>
  `;
  document.body.appendChild(wrap);

  const W = wrap;
  const FAB = wrap.querySelector('#chat-fab');
  const PANEL = wrap.querySelector('#chat-panel');
  const CLOSE = wrap.querySelector('#chat-close');
  const BOX = wrap.querySelector('#chat-box');
  const FORM = wrap.querySelector('#chat-form');
  const INPUT = wrap.querySelector('#chat-input');

  let greeted = false;
  let KB = null; // cache JSON

  // ---------- Ovládání ----------
  function openChat() {
    W.setAttribute('data-open', '1');
    FAB.setAttribute('aria-expanded', 'true');
    PANEL.setAttribute('aria-hidden', 'false');
    INPUT?.focus();
    if (!greeted) {
      greeted = true;
      appendBot(GREETING);
    }
  }
  function closeChat() {
    W.removeAttribute('data-open');
    FAB.setAttribute('aria-expanded', 'false');
    PANEL.setAttribute('aria-hidden', 'true');
  }
  FAB.addEventListener('click', openChat);
  CLOSE.addEventListener('click', closeChat);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && W.getAttribute('data-open') === '1') closeChat();
  });

  // ---------- UI helpers ----------
  function scrollToBottom(){ BOX.scrollTop = BOX.scrollHeight; }
  function timeNow(){
    const d=new Date();
    return d.toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'});
  }
  function escapeHtml(str){
    return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  }
  function appendMe(text){
    BOX.insertAdjacentHTML('beforeend', `
      <div class="chat-msg me">
        <div class="chat-bubble me">${escapeHtml(text)}</div>
        <div class="chat-meta">${timeNow()}</div>
      </div>
    `);
    scrollToBottom();
  }
  function appendBot(text){
    BOX.insertAdjacentHTML('beforeend', `
      <div class="chat-msg ai">
        <div class="chat-bubble">${text}</div>
        <div class="chat-meta">${timeNow()}</div>
      </div>
    `);
    scrollToBottom();
  }
  function appendThinking(){
    const id = `thinking-${Date.now()}`;
    BOX.insertAdjacentHTML('beforeend', `
      <div class="chat-msg ai" id="${id}">
        <div class="chat-bubble"><em>${BOT_NAME} přemýšlí…</em></div>
        <div class="chat-meta">${timeNow()}</div>
      </div>
    `);
    scrollToBottom();
    return id;
  }
  function replaceThinking(id, text){
    const node = document.getElementById(id);
    if (!node) return appendBot(text);
    node.querySelector('.chat-bubble').innerHTML = text;
  }

  // ---------- Načtení znalostní báze ----------
  async function loadKB(){
    if (KB) return KB;
    const r = await fetch(KB_URL, { cache: 'no-store' });
    KB = await r.json();
    return KB;
  }

  // ---------- Normalizace + skórování shody ----------
  function norm(s){
    return (s || "")
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'') // bez diakritiky
      .replace(/[^a-z0-9á-ž\s]/gi,' ') // odstranění symbolů
      .replace(/\s+/g,' ')
      .trim();
  }
  function tokens(s){ return norm(s).split(' ').filter(Boolean); }
  function jaccard(a,b){
    const A = new Set(a), B = new Set(b);
    const inter = [...A].filter(x => B.has(x)).length;
    const uni = new Set([...A, ...B]).size || 1;
    return inter / uni;
  }
  function scoreQuery(query, key){
    // bonus: přesná/částečná shoda
    const nq = norm(query), nk = norm(key);
    let score = 0;
    if (nq.includes(nk) || nk.includes(nq)) score += 0.55;
    // jaccard na tokenech
    score += jaccard(tokens(nq), tokens(nk)) * 0.7;
    // délkový bonus pro kratší klíče (aby „cenik“ vyhrál nad dlouhými větami)
    score += Math.max(0, 0.15 - Math.min(nk.length, 40)/400);
    return score;
  }

  async function askFromJSON(userText){
    const db = await loadKB();
    const input = userText || '';
    const keys = Object.keys(db).filter(k => k !== 'default');
    if (!keys.length) return "Databáze odpovědí je prázdná.";

    // najdi nejlepší shodu
    let bestKey = null, bestScore = -1;
    for (const k of keys){
      const s = scoreQuery(input, k);
      if (s > bestScore){ bestScore = s; bestKey = k; }
    }
    // threshold (když je dotaz úplně mimo)
    if (bestScore < 0.18){
      return db.default || "Promiň, nerozumím. Zkus to říct jinak 🙂";
    }
    return db[bestKey] || db.default || "Promiň, nerozumím. Zkus to říct jinak 🙂";
  }

  // ---------- Odesílání ----------

  FORM.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = (INPUT.value || '').trim();
    if (!msg) return;
    appendMe(msg);
    INPUT.value = '';
    const thinkingId = appendThinking();
    try{
      const reply = await askFromJSON(msg);
      replaceThinking(thinkingId, reply);
    }catch(err){
      replaceThinking(thinkingId, `⚠️ Chyba: ${escapeHtml(err.message || String(err))}`);
    }
  });
})();
