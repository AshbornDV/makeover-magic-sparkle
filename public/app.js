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
  'Valorant': { slug:'valorant', publisher:'RIOT GAMES', subtitle:'VP for supported regions', tone:'red', image:'/assets/games/valorant-wordmark.svg', imageType:'wordmark' },
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
  const host = $('#previewGames');
  if (!host) return;
  host.innerHTML = games.slice(0,4).map(g => {
    const m = getMeta(g);
    return `<button class="preview-game ${m.imageType==='wordmark'?'wordmark-frame':''}" onclick="openGame('${m.slug}')"><img class="${m.imageType==='wordmark'?'wordmark-icon':''}" src="${m.image}" alt="${g}" onerror="this.src=fallbackImage('${g}')"><span>${g}</span><b>↗</b></button>`;
  }).join('');
}

function renderFeaturedCard() {
  const product = products.find(p=>p.game==='Mobile Legends'&&p.hot) || products.find(p=>p.game==='Mobile Legends');
  if (!product || !$('#featuredPackage')) return;
  $('#featuredPackage').textContent = `${product.title} · ${product.region || 'Global'}`;
  $('#featuredPrice').textContent = money(product.displayPrice,currency);
}

function renderHome() {
  document.title = `${cfg.brand.name} — Fast Game Credits`;
  const q = ($('#search')?.value || '').toLowerCase().trim();
  const games = [...new Set(products.map(p => p.game))];
  $('#gameCount').textContent = games.length;
  renderFeaturedCard();
  const categories = [
    ['ALL','All games'],
    ['MOBILE','Mobile'],
    ['PC','PC & Wallets'],
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
    <div class="game-card-image tone-${meta.tone} ${meta.imageType==='wordmark'?'wordmark-frame':''}"><img class="${meta.imageType==='wordmark'?'wordmark-icon':''}" src="${meta.image}" alt="${game} ${meta.imageType==='wordmark'?'wordmark':'icon'}" loading="lazy" decoding="async" onerror="this.src=fallbackImage('${game}')"><span class="game-card-shade"></span><span class="game-card-arrow">↗</span></div>
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
      <div class="game-page-hero-main"><div class="large-game-icon ${meta.imageType==='wordmark'?'wordmark-frame':''}"><img class="${meta.imageType==='wordmark'?'wordmark-icon':''}" src="${meta.image}" alt="${game} ${meta.imageType==='wordmark'?'wordmark':'icon'}" onerror="this.src=fallbackImage('${game}')"></div><div><span class="section-kicker">${meta.publisher}</span><h1>${game}</h1><p>${meta.subtitle}</p><div class="hero-tags"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/></svg>Catalog preview</span><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>Purchases soon</span><span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>${regions.join(' • ') || 'Global'}</span></div></div></div>
    </div>

    <div class="product-page-grid">
      <div class="packages-column">
        <div class="page-heading"><div><span class="section-kicker">PACKAGE PREVIEW</span><h2>Explore the options.</h2><p>Browse package details and indicative pricing. Checkout will open when secure ordering is ready.</p></div><a class="mini-back" onclick="goHome()">Browse another game →</a></div>
        ${[...grouped.entries()].map(([region, arr]) => renderRegion(region, arr)).join('')}
      </div>
      <aside class="info-rail"><div class="info-card"><span class="info-number">01</span><h3>What you'll need</h3><div class="info-fields">${[...new Set(items.flatMap(p=>p.fields||[]))].map(f=>`<span>${fieldLabel(f)}</span>`).join('')}</div><p>Only enter the details shown for the package. Never share your game password.</p></div><div class="info-card"><span class="info-number">02</span><h3>Delivery</h3><p>Orders are routed after your payment is verified. Delivery speed depends on the connected supplier and game.</p></div><div class="info-card accent"><span class="info-number">03</span><h3>Need help?</h3><p>Keep your order ID. Support can use it to locate your payment and fulfillment status.</p><a href="/#support">Contact support →</a></div></aside>
    </div>
  </section>`;
}

function renderRegion(region, arr) {
  const ordered = [...arr].sort((a,b)=>a.displayPrice-b.displayPrice);
  const popular = ordered.filter(p=>p.hot);
  const orderedAll = popular.length ? [...popular,...ordered.filter(p=>!popular.includes(p))] : ordered;
  const tile = p => `<article class="package-row package-tile ${p.hot?'hot':''}">${renderPackageIcon(p)}<div class="package-copy"><span>${p.hot?'POPULAR':'PACKAGE'}</span><h4>${p.title}</h4><p>${p.region && p.region!=='Global'?p.region:(p.region==='Global' && p.game==='Steam Wallet'?'Global · account region required':p.game==='Brawl Stars'?'In-game store offer · Supercell ID required':'Instant top-up')}</p></div><div class="package-price"><strong>${money(p.displayPrice,currency)}</strong><button aria-label="Buy ${p.title}" onclick="openBuy('${p.id}')">Choose <span>↗</span></button></div></article>`;
  return `<section class="region-block"><div class="region-title"><div><span class="section-kicker">REGION</span><h3>${region}</h3></div><span>${arr.length} package${arr.length===1?'':'s'}</span></div><div class="package-list featured-packages package-catalog-grid">${orderedAll.map(tile).join('')}</div></section>`;
}
function currencyIconAsset(p) {
  const icons = {
    'Mobile Legends':'/assets/currency/ml-diamond.png',
    'Free Fire':'/assets/currency/ff-diamond.png',
    'PUBG Mobile':'/assets/currency/pubg-uc.png',
    'Genshin Impact':'/assets/currency/genshin-crystal.webp',
    'Honkai: Star Rail':'/assets/currency/honkai-shards.png',
    'Zenless Zone Zero':'/assets/currency/zzz-monochrome.webp',
    'Call of Duty Mobile':'/assets/currency/codm-cp.png',
    'Honor of Kings':'/assets/currency/honor-tokens.webp',
    'Brawl Stars':'/assets/currency/brawl-gem.png',
    'Roblox':'/assets/currency/robux.svg',
    'Steam Wallet':'/assets/games/steam.jpg',
    'Valorant':'/assets/currency/valorant-points.png',
    'Blood Strike':'/assets/currency/blood-strike-gold.webp'
  };
  return icons[p.game] || '';
}
function packageImageAsset(p) {
  // Product artwork is kept local: a pass gets its own art; denomination packs
  // keep the game's real currency symbol and show the quantity beside it.
  const productArt = {
    'mlbb-weekly-pass':'/assets/packages/ml-weekly-pass.png',
    'mlbb-weekly-elite':'/assets/packages/ml-weekly-elite.webp',
    'mlbb-monthly-epic':'/assets/packages/ml-monthly-epic.webp',
    'mlbb-twilight':'/assets/packages/ml-twilight-pass.webp',
    'hsr-express-pass':'/assets/packages/hsr-express-supply-pass.png',
    'zzz-inter-knot':'/assets/packages/zzz-inter-knot-membership.png',
    'genshin-welkin':'/assets/packages/genshin-welkin-moon.jpg',
    'hok-weekly':'/assets/packages/hok-weekly-card-thumb.jpg',
    'hok-weekly-plus':'/assets/packages/hok-weekly-card-thumb.jpg',
    'ff-weekly':'/assets/packages/free-fire-weekly-membership.webp',
    'ff-monthly':'/assets/packages/free-fire-monthly-membership.png',
    'brawl-pass':'/assets/packages/brawl-pass-plus.jpg',
    'brawl-pass-plus':'/assets/packages/brawl-pass-plus.jpg'
  };
  return productArt[p.id] || '';
}
function renderPackageIcon(p) {
  const type = packageArtType(p);
  const classes = `package-icon package-icon--${packageKind(p)} package-icon--${type}`;
  const productArt = packageImageAsset(p);
  if (productArt) {
    const fallback = currencyIconAsset(p) || '';
    return `<div class="${classes} package-icon--product" aria-hidden="true"><img src="${productArt}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><img class="package-icon-fallback" src="${fallback}" alt="" hidden></div>`;
  }
  if (type !== 'currency') return `<div class="${classes}" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false">${packageArtwork(p)}</svg></div>`;
  const asset = currencyIconAsset(p);
  const amount = packageQuantity(p);
  const fallback = `<svg class="currency-fallback" viewBox="0 0 48 48" focusable="false" hidden>${packageArtwork(p)}</svg>`;
  const coins = asset
    ? Array.from({length:amount.stack},()=>`<span class="currency-chip"><img src="${asset}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false">${fallback}</span>`).join('')
    : `<span class="currency-chip">${fallback.replace(' hidden','')}</span>`;
  return `<div class="${classes}" aria-hidden="true"><span class="currency-stack currency-stack--${amount.stack}">${coins}</span><span class="package-count">${amount.label}</span></div>`;
}
function packageArtType(p) {
  const title = `${p.title||''} ${p.units||''}`.toLowerCase();
  if (/first\s+recharge|first\s+top.?up/.test(title)) return 'first-recharge';
  if (/twilight/.test(title)) return 'pass-twilight';
  if (/weekly.*pass|weekly diamond pass|weekly pass/.test(title)) return 'pass-weekly';
  if (/monthly.*pass|monthly card|welkin|express supply|membership/.test(title)) return 'pass-monthly';
  if (/\bpass\b/.test(title)) return 'pass-standard';
  if (/bundle|\bpack\b/.test(title)) {
    if (/weekly/.test(title)) return 'bundle-weekly';
    if (/monthly|epic|legendary/.test(title)) return 'bundle-premium';
    return 'bundle-standard';
  }
  return 'currency';
}
function packageQuantity(p) {
  const values = [...String(p.units||p.title||'').matchAll(/[\d,]+/g)].map(m=>Number(m[0].replace(/,/g,''))).filter(Number.isFinite);
  const amount = values.reduce((sum,n)=>sum+n,0);
  const short = n => n >= 10000 ? `${(n/1000).toFixed(0)}k` : n >= 1000 ? `${(n/1000).toFixed(n%1000?1:0)}k` : String(n);
  const label = values.length>1 ? `${short(values[0])}+${short(values[1])}` : values.length ? short(values[0]) : 'SET';
  return {label,stack:amount<=100?1:amount<=300?2:amount<=1000?3:4};
}
function packageKind(p) {
  const value = `${p.units||''} ${p.title||''} ${p.game||''}`.toLowerCase();
  if (/diamond|crystal|shard|monochrome|gem/.test(value)) return 'crystal';
  if (/pass|membership|welkin|express/.test(value)) return 'pass';
  if (/wallet|steam|robux/.test(value)) return 'wallet';
  if (/uc|gold|coin|cp|token|vp|point/.test(value)) return 'coin';
  return 'bundle';
}
function packageArtwork(p) {
  const artType = packageArtType(p);
  if (artType === 'pass-weekly') return '<rect class="art-pass" x="8" y="4" width="32" height="40" rx="5"/><path class="art-pass-line" d="M8 14h32"/><circle class="art-pass-dot" cx="15" cy="9" r="1.5"/><circle class="art-pass-dot" cx="33" cy="9" r="1.5"/><path class="art-pass-star" d="m24 18 2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8-3.5-3.4 4.8-.7L24 18Z"/><text class="art-pass-label" x="24" y="39" text-anchor="middle">7D</text>';
  if (artType === 'pass-monthly') return '<rect class="art-pass-back" x="11" y="5" width="30" height="38" rx="5"/><rect class="art-pass" x="7" y="8" width="30" height="36" rx="5"/><path class="art-pass-line" d="M7 17h30"/><path class="art-pass-star" d="m22 22 2 4 4.5.7-3.2 3.1.8 4.4-4.1-2.1-4.1 2.1.8-4.4-3.2-3.1 4.5-.7 2-4Z"/><text class="art-pass-label" x="22" y="15" text-anchor="middle">30D</text>';
  if (artType === 'pass-twilight') return '<rect class="art-pass" x="7" y="7" width="34" height="36" rx="6"/><path class="art-pass-line" d="M7 16h34"/><path class="art-moon" d="M27 20a8 8 0 1 0 8 11 7 7 0 0 1-8-11Z"/><path class="art-pass-star" d="m17 22 1.4 2.8 3.1.5-2.2 2.1.5 3.1-2.8-1.5-2.8 1.5.5-3.1-2.2-2.1 3.1-.5L17 22Z"/><text class="art-pass-label" x="24" y="39" text-anchor="middle">PASS</text>';
  if (artType === 'pass-standard') return '<path class="art-ticket" d="M8 10h32v8a5 5 0 0 0 0 10v8H8v-8a5 5 0 0 0 0-10v-8Z"/><path class="art-pass-line" d="M24 13v4m0 12v4"/><path class="art-pass-star" d="m17 20 1.8 3.7 4.1.6-3 2.9.7 4.1-3.6-1.9-3.6 1.9.7-4.1-3-2.9 4.1-.6L17 20Z"/>';
  if (artType.startsWith('bundle')) return '<path class="art-bundle-back" d="M9 17h30l-3 24H12L9 17Z"/><path class="art-bundle-lid" d="M6 14h36v7H6z"/><path class="art-bundle-ribbon" d="M20 14h8v27h-8z"/><path class="art-bundle-bow" d="M24 14c-7-1-11-4-8-7 3-2 7 3 8 7Zm0 0c7-1 11-4 8-7-3-2-7 3-8 7Z"/><path class="art-bundle-gem" d="m35 27 5 4-5 5-5-5 5-4Z"/>';
  if (artType === 'first-recharge') return '<path class="art-halo" d="M24 3 39 16 30 40H18L9 16 24 3Z"/><path class="art-gem" d="m24 7 10 10-6 18h-8l-6-18L24 7Z"/><path class="art-glint" d="m24 7 4 10h-8l4-10Z"/><path class="art-first-bolt" d="M27 19h-6l-2 8h5l-1 6 7-10h-5l2-4Z"/>';
  const kind = packageKind(p);
  if (kind === 'crystal') return '<path class="art-halo" d="M24 3 39 16 30 40H18L9 16 24 3Z"/><path class="art-gem" d="m24 7 10 10-6 18h-8l-6-18L24 7Z"/><path class="art-glint" d="m24 7 4 10h-8l4-10Z"/>';
  if (kind === 'pass') return '<path class="art-halo" d="M24 4 39 10v12c0 10-6 16-15 22C15 38 9 32 9 22V10l15-6Z"/><path class="art-mark" d="m24 13 2.7 6.1 6.6.6-5 4.3 1.5 6.5-5.8-3.4-5.8 3.4 1.5-6.5-5-4.3 6.6-.6L24 13Z"/>';
  if (kind === 'wallet') return '<rect class="art-halo" x="7" y="11" width="34" height="27" rx="7"/><path class="art-mark" d="M8 17h32v5H8z"/><circle class="art-dot" cx="31" cy="29" r="3"/>';
  if (kind === 'coin') return '<circle class="art-halo" cx="24" cy="24" r="18"/><circle class="art-mark-ring" cx="24" cy="24" r="13"/><path class="art-mark" d="M26.5 15v2.3c3 .4 4.8 2.2 4.9 4.7h-4.1c-.1-1.1-.9-1.8-2.3-1.8-1.2 0-1.9.5-1.9 1.3 0 .9 1 1.3 3.1 1.8 3.3.8 5.4 1.9 5.4 5 0 2.8-2 4.7-5.1 5.1v2.2h-3.1v-2.2c-3.2-.4-5.2-2.3-5.3-5.1h4.1c.1 1.2 1 1.9 2.5 1.9 1.3 0 2.2-.5 2.2-1.4s-.9-1.3-3.1-1.9c-3.4-.8-5.4-2-5.4-5 0-2.6 1.9-4.4 5-4.8V15h3.1Z"/>';
  return '<path class="art-halo" d="m24 4 5.8 11.8L43 17.6l-9.5 9.2 2.2 13L24 33.7l-11.7 6.1 2.2-13L5 17.6l13.2-1.8L24 4Z"/><circle class="art-dot" cx="24" cy="23" r="4"/>';
}

function openBuy(id) {
  const p = products.find(x=>x.id===id); if(!p) return;
  const meta = getMeta(p.game);
  $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
  $('#modalBody').innerHTML = `<div class="checkout-head"><img class="checkout-icon ${meta.imageType==='wordmark'?'wordmark-icon':''}" src="${meta.image}" alt="${p.game} ${meta.imageType==='wordmark'?'wordmark':'icon'}" onerror="this.src=fallbackImage('${p.game}')"><div><span class="section-kicker">CHECKOUT PREVIEW</span><h2>${p.game}</h2><p>${p.title} • ${p.region}</p></div></div>
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
