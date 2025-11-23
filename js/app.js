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


// ====== CHAT KATKA — Messenger bublina v jednom JS ======
(() => {
  // ------- CONFIG -------
  const OPENAI_API_KEY = "sk-PASTE_YOUR_KEY_HERE"; // ⚠️ vlož svůj klíč (veřejné!)
  const MODEL = "gpt-4o";                            // model
  const GREETING = "Dobrý den, jmenuji se Katka. Jsem virtuální asistentka Solária Hranice. S čím vám mohu pomoci?";

  // ------- Inject CSS (bez úprav existujícího style.css) -------
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

  // ------- Build DOM -------
  const wrap = document.createElement('div');
  wrap.id = 'chat-widget';
  wrap.innerHTML = `
    <button id="chat-fab" class="chat-fab" aria-label="Otevřít chat s Katkou" aria-expanded="false">💬</button>
    <section id="chat-panel" class="chat-panel card glass" aria-hidden="true" role="dialog" aria-label="Chat s Katkou">
      <header class="chat-header">
        <div class="chat-avatar">K</div>
        <div class="chat-title"><strong>Katka</strong><span>Virtuální asistentka</span></div>
        <button id="chat-close" class="btn btn-icon" aria-label="Zavřít chat">✕</button>
      </header>
      <div id="chat-box" class="chat-box"></div>
      <form id="chat-form" class="chat-input-row" autocomplete="off">
        <input id="chat-input" type="text" placeholder="Napiš zprávu…" aria-label="Zpráva pro Katku" />
        <button type="submit" class="btn btn-primary btn-sheen">Odeslat</button>
      </form>
    </section>
  `;
  document.body.appendChild(wrap);

  // ------- Refs -------
  const W = wrap;
  const FAB = wrap.querySelector('#chat-fab');
  const PANEL = wrap.querySelector('#chat-panel');
  const CLOSE = wrap.querySelector('#chat-close');
  const BOX = wrap.querySelector('#chat-box');
  const FORM = wrap.querySelector('#chat-form');
  const INPUT = wrap.querySelector('#chat-input');

  let greeted = false;

  function openChat() {
    W.setAttribute('data-open', '1');
    FAB.setAttribute('aria-expanded', 'true');
    PANEL.setAttribute('aria-hidden', 'false');
    INPUT?.focus();
    if (!greeted) {
      greeted = true;
      appendKatka(GREETING);
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

  // ------- UI helpers -------
  function scrollToBottom() { BOX.scrollTop = BOX.scrollHeight; }
  function timeNow() {
    const d = new Date();
    return d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  }
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
  }
  function appendMe(text) {
    BOX.insertAdjacentHTML('beforeend', `
      <div class="chat-msg me">
        <div class="chat-bubble me">${escapeHtml(text)}</div>
        <div class="chat-meta">${timeNow()}</div>
      </div>
    `);
    scrollToBottom();
  }
  function appendKatka(text) {
    BOX.insertAdjacentHTML('beforeend', `
      <div class="chat-msg ai">
        <div class="chat-bubble">${text}</div>
        <div class="chat-meta">${timeNow()}</div>
      </div>
    `);
    scrollToBottom();
  }
  function appendThinking() {
    const id = `thinking-${Date.now()}`;
    BOX.insertAdjacentHTML('beforeend', `
      <div class="chat-msg ai" id="${id}">
        <div class="chat-bubble"><em>Katka přemýšlí…</em></div>
        <div class="chat-meta">${timeNow()}</div>
      </div>
    `);
    scrollToBottom();
    return id;
  }
  function replaceThinking(id, text) {
    const node = document.getElementById(id);
    if (!node) return appendKatka(text);
    node.querySelector('.chat-bubble').innerHTML = text;
  }

  // ------- OpenAI call -------
  async function askOpenAI(userText) {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'Jsi přátelská a profesionální asistentka jménem Katka. Odpovídej česky, stručně a srozumitelně. Znáš ceník, otevírací dobu a služby Solária Hranice.' },
          { role: 'user', content: userText }
        ],
        temperature: 0.7
      })
    });
    if (!r.ok) {
      const t = await r.text().catch(()=>r.statusText);
      throw new Error(`HTTP ${r.status}: ${t}`);
    }
    const data = await r.json();
    return data?.choices?.[0]?.message?.content?.trim() || 'Omlouvám se, zkuste to prosím ještě jednou.';
  }

  // ------- Submit handler -------
  FORM.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = (INPUT.value || '').trim();
    if (!msg) return;
    appendMe(msg);
    INPUT.value = '';
    const thinkingId = appendThinking();
    try {
      const reply = await askOpenAI(msg);
      replaceThinking(thinkingId, reply);
    } catch (err) {
      replaceThinking(thinkingId, `⚠️ Chyba: ${escapeHtml(err.message || String(err))}`);
    }
  });
})();
// ===== Czech-friendly text utils =====
const PRICE = { H: 19, V: 18 }; // Kč/min – horizontální / vertikální

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // bez diakritiky
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function bigrams(s) {
  const t = normalize(s).replace(/\s+/g, " ");
  const grams = [];
  for (let i = 0; i < t.length - 1; i++) {
    grams.push(t.slice(i, i + 2));
  }
  return grams;
}
function diceSim(a, b) {
  // Sørensen–Dice na bigramech (robustní pro češtinu a překlepy)
  const A = bigrams(a), B = bigrams(b);
  if (!A.length || !B.length) return 0;
  const map = new Map();
  for (const g of A) map.set(g, (map.get(g) || 0) + 1);
  let inter = 0;
  for (const g of B) {
    const c = map.get(g) || 0;
    if (c > 0) { inter++; map.set(g, c - 1); }
  }
  return (2 * inter) / (A.length + B.length);
}
function containsStemFuzzy(text, stem, thr = 0.62) {
  // rychlá cesta: podřetězec kořene
  if (normalize(text).includes(normalize(stem))) return true;
  // fuzzy: porovnej stem s každým slovem textu
  const tokens = normalize(text).split(" ");
  return tokens.some(tok => diceSim(tok, stem) >= thr);
}

// Dynamická cena typu „kolik stojí 12 minut“
function tryDynamicPrice(text) {
  const t = normalize(text);
  const hasPriceVerb = /(kolik|stoj|cena|cenik)/.test(t);
  const unitMention = /(min|minut|minuty|minuta)/.test(t);
  const m = t.match(/\b(\d{1,3})\b/);
  if (hasPriceVerb && unitMention && m) {
    const minutes = parseInt(m[1], 10);
    if (minutes > 0 && minutes <= 300) {
      const h = minutes * PRICE.H;
      const v = minutes * PRICE.V;
      return `${minutes} minut: Horizontální ${h} Kč, Vertikální ${v} Kč.`;
    }
  }
  return null;
}

// Hlavní matcher – funguje s libovolným počtem intentů
async function answerFromKB(userText) {
  // načti znalosti
  if (!window.__KB) {
    try {
      const res = await fetch("frantisek.json", { cache: "no-store" });
      window.__KB = await res.json();
    } catch (err) {
      return "⚠️ Nepodařilo se načíst znalostní bázi.";
    }
  }
  const kb = window.__KB;
  const t = userText || "";

  // 1) zkus dynamickou cenu
  const dyn = tryDynamicPrice(t);
  if (dyn) return dyn;

  // 2) skórování intentů
  let best = null, bestScore = -Infinity;

  for (const intent of kb.intents || []) {
    const all = intent.all || [];
    const any = intent.any || [];
    const not = intent.not || [];

    // NOT – když něco zakážeme, vypadává
    if (not.some(stem => containsStemFuzzy(t, stem))) continue;

    // ALL – všechna musí projít
    const allOk = all.every(stem => containsStemFuzzy(t, stem));
    if (!allOk) continue;

    // ANY – prázdné = OK, jinak aspoň jedno
    const anyHits = any.filter(stem => containsStemFuzzy(t, stem));
    const anyOk = any.length === 0 || anyHits.length > 0;
    if (!anyOk) continue;

    // skóre: počet zásahů + bonus za krátké dotazy + „přesná fráze“
    let score = 0;
    score += anyHits.length * 1.0;
    score += Math.max(0, 0.6 - normalize(t).length / 120); // kratší dotaz, vyšší bonus
    if (intent.phrases) {
      // nepovinné: přesné fráze zvyšují skóre
      for (const ph of intent.phrases) {
        if (normalize(t).includes(normalize(ph))) score += 0.8;
      }
    }
    if (score > bestScore) { bestScore = score; best = intent; }
  }

  // 3) threshold: když nic moc nerezonuje, hoď default
  if (!best || bestScore < 0.2) return kb.default || "Omlouvám se, nerozumím dotazu.";

  // 4) šablona s {{dynamic_price}} apod.
  let ans = best.answer || kb.default || "Děkuji, ale nerozumím.";
  if (ans.includes("{{dynamic_price}}")) {
    const dyn2 = tryDynamicPrice(t);
    ans = dyn2 || "Pro upřesnění prosím napište počet minut (např. 12 minut).";
  }
  return ans;
}

