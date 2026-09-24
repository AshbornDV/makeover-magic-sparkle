let cfg = {};
let products = [];
let currency = 'NPR';
let activeCategory = 'ALL';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (v, c) => new Intl.NumberFormat(undefined, { style: 'currency', currency: c, maximumFractionDigits: c === 'NPR' ? 0 : 2 }).format(v);

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('nexa-theme', theme); } catch {}
  const toggle = $('#themeToggle');
  if (toggle) {
    const next = theme === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', `Switch to ${next} mode`);
    toggle.title = `Switch to ${next} mode`;
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0b1117' : '#f5f7f8';
}

$('#themeToggle')?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  try { localStorage.setItem('nexa-theme', next); } catch {}
});
setTheme(document.documentElement.dataset.theme || 'dark');

const gameMeta = {
  'Mobile Legends': { slug:'mobile-legends', publisher:'MOONTON', subtitle:'Diamonds, passes & limited bundles', tone:'violet', image:'/assets/games/mobile-legends.jpg' },
  'Free Fire': { slug:'free-fire', publisher:'GARENA', subtitle:'Diamonds, memberships & passes', tone:'cyan', image:'/assets/games/free-fire.jpg' },
  'PUBG Mobile': { slug:'pubg-mobile', publisher:'TENCENT', subtitle:'UC packages for your account', tone:'orange', image:'/assets/games/pubg-mobile.jpg' },
  'Genshin Impact': { slug:'genshin', publisher:'HOYOVERSE', subtitle:'Genesis Crystals & character bundles', tone:'rose', image:'/assets/games/genshin-impact.jpg' },
  'Honkai: Star Rail': { slug:'honkai-star-rail', publisher:'HOYOVERSE', subtitle:'Oneiric Shards & battle passes', tone:'blue', image:'/assets/games/honkai-star-rail.jpg' },
  'Zenless Zone Zero': { slug:'zzz', publisher:'HOYOVERSE', subtitle:'Monochromes, memberships & packs', tone:'violet', image:'/assets/games/zenless-zone-zero.jpg' },
  'Valorant': { slug:'valorant', publisher:'RIOT GAMES', subtitle:'VP for supported regions', tone:'red', image:'/assets/games/valorant.jpg' },
  'Roblox': { slug:'roblox', publisher:'ROBLOX', subtitle:'Robux and digital offers', tone:'pink', image:'/assets/games/roblox.jpg' },
  'Steam Wallet': { slug:'steam', publisher:'STEAM', subtitle:'Wallet credit for supported regions', tone:'blue', image:'/assets/games/steam.jpg' },
  'Call of Duty Mobile': { slug:'codm', publisher:'ACTIVISION', subtitle:'CP for supported regions', tone:'green', image:'/assets/games/call-of-duty-mobile.jpg' },
  'Honor of Kings': { slug:'honor-of-kings', publisher:'LEVEL INFINITE', subtitle:'Tokens and game offers', tone:'gold', image:'/assets/games/honor-of-kings.jpg' },
  'Blood Strike': { slug:'blood-strike', publisher:'NETEASE', subtitle:'Gold, passes & event products', tone:'red', image:'/assets/games/blood-strike.jpg' },
  'Brawl Stars': { slug:'brawl-stars', publisher:'SUPERCELL', subtitle:'Gems, passes & special offers', tone:'orange', image:'/assets/games/brawl-stars.jpg' }
};

const fallbackImage = (title) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#27343e"/><stop offset="1" stop-color="#111a22"/></linearGradient><linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c4ebd4"/><stop offset="1" stop-color="#83c4a2"/></linearGradient></defs><rect x="2" y="2" width="316" height="316" rx="76" fill="url(#bg)" stroke="#42534f" stroke-width="4"/><circle cx="160" cy="160" r="94" fill="#1a252d" stroke="url(#accent)" stroke-width="4"/><circle cx="160" cy="160" r="75" fill="none" stroke="#ffffff" stroke-opacity=".06" stroke-width="2"/><text x="160" y="188" text-anchor="middle" fill="url(#accent)" font-family="Manrope,Arial,sans-serif" font-size="88" font-weight="800">${(title||'N').charAt(0).toUpperCase()}</text><circle cx="256" cy="63" r="8" fill="#c4ebd4" fill-opacity=".8"/></svg>`)}`;

function slugify(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function getMeta(game) { return gameMeta[game] || { slug: slugify(game), publisher:'GAME', subtitle:'Top-up packages', tone:'blue', image:fallbackImage(game) }; }
function currentRoute() { const m = location.pathname.match(/^\/game\/([^/]+)\/?$/); return m ? m[1] : null; }

async function loadConfig() {
  cfg = await fetch('/api/config').then(r => r.json());
  if ($('#demoNote')) $('#demoNote').hidden = !cfg.demoMode;
  $('#brandName').textContent = cfg.brand.name;
  $('#year').textContent = new Date().getFullYear();
  const country = $('#country'), currencySel = $('#currency');
  country.innerHTML = cfg.countries.map(x => `<option value="${x.code}">${x.name}</option>`).join('');
  currencySel.innerHTML = [...new Set(cfg.countries.map(x => x.currency))].map(c => `<option value="${c}">${c}</option>`).join('');
  country.value = 'NP'; currency = 'NPR'; currencySel.value = 'NPR';
  country.onchange = e => { const cc = cfg.countries.find(x => x.code === e.target.value); currency = cc.currency; currencySel.value = currency; refreshPage(); };
  currencySel.onchange = e => { currency = e.target.value; refreshPage(); };
  if ($('#search')) $('#search').oninput = renderHome;
}

async function fetchProducts() {
  const data = await fetch(`/api/products?currency=${encodeURIComponent(currency)}`).then(r => r.json());
  products = data.products || [];
}

async function refreshPage() {
  await fetchProducts();
  const route = currentRoute();
  route ? renderGamePage(route) : renderHome();
}

function renderPreviewGames(games) {
  $('#previewGames').innerHTML = games.slice(0,4).map(g => {
    const m = getMeta(g);
    return `<button class="preview-game" onclick="openGame('${m.slug}')"><img src="${m.image}" alt="${g}" onerror="this.src=fallbackImage('${g}')"><span>${g}</span><b>↗</b></button>`;
  }).join('');
}

function renderHome() {
  document.title = `${cfg.brand.name} — Fast Game Credits`;
  const q = ($('#search')?.value || '').toLowerCase().trim();
  const games = [...new Set(products.map(p => p.game))];
  $('#gameCount').textContent = games.length;
  const categories = [
    ['ALL','All games'],
    ['MOBILE','Mobile'],
    ['PC','PC & Wallets'],
    ['OTHER','More']
  ];
  $('#filters').innerHTML = categories.map(([key,label]) => `<button class="tab ${activeCategory===key?'active':''}" onclick="setCategory('${key}')">${label}</button>`).join('');

  const visible = games.filter(game => {
    const meta = getMeta(game);
    const category = products.find(p=>p.game===game)?.category || (['Steam Wallet','Valorant'].includes(game) ? 'PC' : 'MOBILE');
    const matchesCat = activeCategory==='ALL' || category===activeCategory;
    const hay = `${game} ${meta.publisher} ${meta.subtitle}`.toLowerCase();
    return matchesCat && (!q || hay.includes(q));
  });

  $('#gameGrid').innerHTML = visible.length ? visible.map(renderGameCard).join('') : `<div class="empty-state"><div>⌕</div><h3>No game found</h3><p>Try another search or switch the category.</p></div>`;
  renderPreviewGames(games);
  if (location.hash === '#games') setTimeout(()=>$('#games')?.scrollIntoView({behavior:'smooth'}),0);
}

function renderGameCard(game) {
  const meta = getMeta(game);
  const count = products.filter(p=>p.game===game).length;
  const regions = [...new Set(products.filter(p=>p.game===game).map(p=>p.region))].filter(Boolean);
  return `<article class="game-card" role="button" aria-label="Browse ${game} packages" onclick="openGame('${meta.slug}')" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openGame('${meta.slug}')}">
    <div class="game-card-image tone-${meta.tone}"><img src="${meta.image}" alt="${game} icon" loading="lazy" onerror="this.src=fallbackImage('${game}')"><span class="game-card-shade"></span><span class="game-card-arrow">↗</span></div>
    <div class="game-card-body"><div><span class="game-publisher">${meta.publisher}</span><h3>${game}</h3><p>${meta.subtitle}</p></div><div class="game-card-foot"><span>${count} package${count===1?'':'s'}</span><span>${regions.slice(0,2).join(' • ') || 'Global'} <b>→</b></span></div></div>
  </article>`;
}

function setCategory(cat) { activeCategory = cat; renderHome(); }

function openGame(slug) { history.pushState({},'',`/game/${slug}`); window.scrollTo({top:0,behavior:'smooth'}); renderGamePage(slug); }
function goHome() { history.pushState({},'',`/`); window.scrollTo({top:0,behavior:'smooth'}); renderHome(); }
window.addEventListener('popstate', refreshPage);

function renderGamePage(slug) {
  const games = [...new Set(products.map(p=>p.game))];
  const game = games.find(g => getMeta(g).slug === slug);
  if (!game) { goHome(); return; }
  const meta = getMeta(game);
  document.title = `${game} Top Up — ${cfg.brand.name}`;
  const items = products.filter(p=>p.game===game);
  const regions = [...new Set(items.map(p=>p.region).filter(Boolean))];
  const grouped = new Map();
  items.forEach(p => { const r = p.region || 'Global'; if(!grouped.has(r))grouped.set(r,[]); grouped.get(r).push(p); });

  $('#app').innerHTML = `<section class="game-page">
    <div class="game-page-hero tone-${meta.tone}">
      <button class="back-link" onclick="goHome()">← All games</button>
      <div class="game-page-hero-main"><div class="large-game-icon"><img src="${meta.image}" alt="${game}" onerror="this.src=fallbackImage('${game}')"></div><div><span class="section-kicker">${meta.publisher}</span><h1>${game}</h1><p>${meta.subtitle}</p><div class="hero-tags"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/></svg>Fast delivery</span><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>Secure checkout</span><span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>${regions.join(' • ') || 'Global'}</span></div></div></div>
    </div>

    <div class="product-page-grid">
      <div class="packages-column">
        <div class="page-heading"><div><span class="section-kicker">AVAILABLE PACKAGES</span><h2>Choose your package.</h2><p>Select a package below. You can review your player details and payment method in checkout.</p></div><a class="mini-back" onclick="goHome()">Browse another game →</a></div>
        ${[...grouped.entries()].map(([region, arr]) => renderRegion(region, arr)).join('')}
      </div>
      <aside class="info-rail"><div class="info-card"><span class="info-number">01</span><h3>What you'll need</h3><div class="info-fields">${[...new Set(items.flatMap(p=>p.fields||[]))].map(f=>`<span>${fieldLabel(f)}</span>`).join('')}</div><p>Only enter the details shown for the package. Never share your game password.</p></div><div class="info-card"><span class="info-number">02</span><h3>Delivery</h3><p>Orders are routed after your payment is verified. Delivery speed depends on the connected supplier and game.</p></div><div class="info-card accent"><span class="info-number">03</span><h3>Need help?</h3><p>Keep your order ID. Support can use it to locate your payment and fulfillment status.</p><a href="/#support">Contact support →</a></div></aside>
    </div>
  </section>`;
}

function renderRegion(region, arr) {
  const ordered = [...arr].sort((a,b)=>a.displayPrice-b.displayPrice);
  const popular = ordered.filter(p=>p.hot);
  const featured = (popular.length ? [...popular,...ordered.filter(p=>!popular.includes(p))] : ordered).slice(0,3);
  const featuredIds = new Set(featured.map(p=>p.id));
  const remaining = ordered.filter(p=>!featuredIds.has(p.id));
  const tile = p => `<article class="package-row package-tile ${p.hot?'hot':''}"><div class="package-icon">${packageSymbol(p.units)}</div><div class="package-copy"><span>${p.hot?'POPULAR':'PACKAGE'}</span><h4>${p.title}</h4><p>${p.region && p.region!=='Global'?p.region:(p.region==='Global' && p.game==='Steam Wallet'?'Global · account region required':p.game==='Brawl Stars'?'In-game store offer · Supercell ID required':'Instant top-up')}</p></div><div class="package-price"><strong>${money(p.displayPrice,currency)}</strong><button aria-label="Buy ${p.title}" onclick="openBuy('${p.id}')">Choose <span>↗</span></button></div></article>`;
  return `<section class="region-block"><div class="region-title"><div><span class="section-kicker">REGION</span><h3>${region}</h3></div><span>${arr.length} package${arr.length===1?'':'s'}</span></div><div class="package-list featured-packages">${featured.map(tile).join('')}</div>${remaining.length?`<details class="all-packages"><summary><span>Browse ${remaining.length} more package${remaining.length===1?'':'s'}</span><span class="catalog-count">${arr.length} total <b aria-hidden="true">⌄</b></span></summary><div class="package-list all-package-grid">${remaining.map(tile).join('')}</div></details>`:''}</section>`;
}
function packageSymbol(units='') { if(/diamond/i.test(units)) return '◆'; if(/uc/i.test(units)) return '◈'; if(/vp/i.test(units)) return 'V'; if(/robux/i.test(units)) return 'R'; if(/crystal|shard|mono/i.test(units)) return '✦'; if(/wallet|\$/i.test(units)) return '$'; if(/gold/i.test(units)) return 'G'; if(/token/i.test(units)) return 'T'; if(/gem/i.test(units)) return '◉'; if(/pass/i.test(units)) return '✦'; return '＋'; }

function openBuy(id) {
  const p = products.find(x=>x.id===id); if(!p) return;
  const meta = getMeta(p.game);
  $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
  $('#modalBody').innerHTML = `<div class="checkout-head"><img class="checkout-icon" src="${meta.image}" alt="${p.game}" onerror="this.src=fallbackImage('${p.game}')"><div><span class="section-kicker">CHECKOUT PREVIEW</span><h2>${p.game}</h2><p>${p.title} • ${p.region}</p></div></div>
    <div class="checkout-body"><div class="preview-notice"><span aria-hidden="true">i</span><div><strong>Purchases are not live yet</strong><p>This is a visual preview only. Don’t enter player details or payment information. Nothing will be submitted or charged.</p></div></div>
    <div class="checkout-section preview-fields"><div class="checkout-section-title"><span>1</span><div><b>Player information</b><small>Requested when secure ordering is available.</small></div></div><div class="info-fields">${(p.fields||[]).map(f=>`<span>${fieldLabel(f)}</span>`).join('')}</div></div>
    <div class="checkout-section"><div class="checkout-section-title"><span>2</span><div><b>Payment</b><small>Verified payment options will appear here after setup.</small></div></div><div class="payment-coming-soon">Payment methods coming soon</div></div>
    <div class="checkout-total"><div><small>INDICATIVE PRICE</small><b>${p.title}</b></div><strong>${money(p.displayPrice,currency)}</strong></div>
    <button class="checkout-submit checkout-disabled" type="button" disabled aria-disabled="true">Purchases coming soon</button></div>`;
}
function fieldLabel(f){ return (f||'').replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()); }
function closeModal(){ $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); }
function createOrder(productId) {
  const p=products.find(x=>x.id===productId);const gameData={}; $$('#modal [data-field]').forEach(i=>gameData[i.dataset.field]=i.value.trim());
  if(Object.values(gameData).some(v=>!v)) { $('#checkoutMsg').textContent='Please fill every required field.'; return; }
  const paymentMethod=$('#payMethod').value;
  fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({productId,currency,gameData,paymentMethod,customer:{name:'Guest'}})}).then(r=>r.json()).then(async data=>{
    if(!data.order){ $('#checkoutMsg').textContent=data.error||'Could not create order.'; return; }
    const order=data.order; $('#checkoutMsg').innerHTML=`Order <b>${order.id}</b> created.<br>Starting ${paymentMethod}…`;
    const pay=await fetch('/api/payments/initiate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderId:order.id,provider:paymentMethod})}).then(r=>r.json());
    if(pay.payment?.type==='redirect') location.href=pay.payment.url;
    else if(pay.payment?.type==='form_redirect'){ const f=document.createElement('form'); f.method='POST'; f.action=pay.payment.action; Object.entries(pay.payment.fields).forEach(([k,v])=>{const i=document.createElement('input');i.name=k;i.value=v;i.type='hidden';f.appendChild(i)}); document.body.appendChild(f); f.submit(); }
    else { let msg=`${pay.error||pay.payment?.message||'This provider is not configured yet.'}<br>Order ID: <b>${order.id}</b>`; if(cfg.demoMode) msg+=`<br><br><button class="demo-pay" onclick="demoMarkPaid('${order.id}')">Simulate successful payment</button>`; $('#checkoutMsg').innerHTML=msg; }
  }).catch(()=>$('#checkoutMsg').textContent='Network error. Please try again.');
}
async function demoMarkPaid(orderId){ const r=await fetch('/api/demo/mark-paid',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderId})}); const d=await r.json(); if(!r.ok){$('#checkoutMsg').textContent=d.error||'Demo payment failed';return;} $('#checkoutMsg').innerHTML=`<b>Demo complete.</b><br>Order: ${d.order.id}<br>Status: ${d.order.status}<br>Payment: ${d.order.paymentStatus}<br><br>No real game credit was delivered.`; $('#trackId') && ($('#trackId').value=d.order.id); }
async function trackOrder(){ const id=$('#trackId').value.trim(); if(!id){$('#trackResult').textContent='Enter an order ID.';return;} const r=await fetch('/api/orders/'+encodeURIComponent(id)); const d=await r.json(); $('#trackResult').innerHTML=r.ok?`<b>${d.order.status}</b><br>Payment: ${d.order.paymentStatus}<br>Game: ${d.order.game}<br>Product: ${d.order.productTitle}`:d.error; }

(async()=>{ try { await loadConfig(); await fetchProducts(); currentRoute()?renderGamePage(currentRoute()):renderHome(); } catch(e) { document.body.innerHTML='<main style="padding:60px;font-family:Inter;color:#fff;background:#070a0f;min-height:100vh"><h1>NEXA TOPUP</h1><p>Could not load the store. Start the local server and refresh.</p></main>'; console.error(e); } })();
