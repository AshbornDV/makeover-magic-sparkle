import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const configPath = path.join(dataDir, 'config.json');
const ordersPath = process.env.ORDERS_PATH || path.join(dataDir, 'orders.json');
// Keep live checkout closed until signed payment verification and an authorized supplier adapter exist.
const livePaymentsReady = false;

async function readJson(file, fallback) { try { return JSON.parse(await fs.readFile(file,'utf8')); } catch { return fallback; } }
async function writeJson(file, value) { await fs.writeFile(file, JSON.stringify(value,null,2)); }
async function readConfig() { return readJson(configPath, {products:[],countries:[],demoRatesToNPR:{NPR:1}}); }
async function readOrders() { return readJson(ordersPath, []); }
function json(res, code, value) { res.writeHead(code, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'}); res.end(JSON.stringify(value)); }
function html(res, content) { res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(content); }
function parseBody(req) { return new Promise((resolve,reject)=>{ let s=''; req.on('data',c=>{s+=c; if(s.length>1e6) req.destroy();}); req.on('end',()=>{try{resolve(s?JSON.parse(s):{});}catch(e){reject(e);}}); req.on('error',reject); }); }
function id(prefix='ORD') { return `${prefix}-${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`; }
function rateFor(config, currency) { return Number(config.demoRatesToNPR?.[currency] || 1); }
function displayPrice(config, product, currency) { const r = rateFor(config,currency); const value = currency==='NPR' ? product.priceNpr : product.priceNpr / r; return Math.max(1, Math.round(value*100)/100); }
function hmacBase64(message, secret) { return crypto.createHmac('sha256', secret).update(message).digest('base64'); }

async function createEsewaPayment(order, cfg) {
  const code = process.env.ESEWA_PRODUCT_CODE;
  const secret = process.env.ESEWA_SECRET_KEY;
  if (!code || !secret) throw new Error('eSewa credentials are not configured');
  const base = process.env.ESEWA_PRODUCTION === 'true' ? 'https://epay.esewa.com.np' : (process.env.ESEWA_BASE_URL || 'https://rc-epay.esewa.com.np');
  const total = order.total.toFixed(2);
  const message = `total_amount=${total},transaction_uuid=${order.id},product_code=${code}`;
  const fields = {
    amount: total, tax_amount:'0', total_amount:total, transaction_uuid:order.id, product_code:code,
    product_service_charge:'0', product_delivery_charge:'0',
    success_url:`${process.env.SITE_URL}/payment/esewa/success`,
    failure_url:`${process.env.SITE_URL}/payment/esewa/failure`,
    signed_field_names:'total_amount,transaction_uuid,product_code',
    signature:hmacBase64(message,secret)
  };
  return {type:'form_redirect', action:`${base}/api/epay/main/v2/form`, fields};
}

async function createKhaltiPayment(order) {
  const key = process.env.KHALTI_SECRET_KEY;
  if (!key) throw new Error('Khalti credentials are not configured');
  const base = process.env.KHALTI_PRODUCTION === 'true' ? 'https://khalti.com/api/v2' : 'https://dev.khalti.com/api/v2';
  const r = await fetch(`${base}/epayment/initiate/`, {method:'POST', headers:{'Authorization':`Key ${key}`,'Content-Type':'application/json'}, body:JSON.stringify({
    return_url:`${process.env.SITE_URL}/payment/khalti/callback`, website_url:process.env.SITE_URL,
    amount:Math.round(order.total*100), purchase_order_id:order.id, purchase_order_name:order.productTitle,
    customer_info:{name:order.customer?.name||'Customer',email:order.customer?.email||'orders@example.com',phone:order.customer?.phone||'0000000000'}
  })});
  const data = await r.json();
  if(!r.ok || !data.payment_url) throw new Error(data.detail || data.message || 'Khalti initiation failed');
  return {type:'redirect', url:data.payment_url, pidx:data.pidx};
}

async function fulfillDemo(order) {
  // Replace this adapter with a real authorized B2B supplier API after onboarding.
  order.fulfillment = {provider:'DEMO',status:'TEST_ONLY',message:'Supplier API not configured. No game credit was delivered.'};
  return order;
}

async function routeSupplier(order) {
  if (process.env.DEMO_MODE !== 'false') return fulfillDemo(order);
  // Production adapter hook. Keep supplier secrets server-side.
  throw new Error('Supplier router is not configured. Add an authorized supplier adapter before live fulfillment.');
}

async function api(req,res,url) {
  const cfg = await readConfig();
  if (req.method==='GET' && url.pathname==='/api/config') return json(res,200,{brand:cfg.brand,countries:cfg.countries,demoMode:true,paymentsEnabled:livePaymentsReady});
  if (req.method==='GET' && url.pathname==='/api/products') {
    const currency=url.searchParams.get('currency')||'NPR';
    const products=cfg.products.map(p=>({...p,displayPrice:displayPrice(cfg,p,currency),currency}));
    return json(res,200,{products,currency});
  }
  if (req.method==='GET' && url.pathname.startsWith('/api/orders/')) {
    if (!livePaymentsReady) return json(res,503,{error:'Order tracking will be available when purchases are live.'});
    const orderId=decodeURIComponent(url.pathname.split('/').pop()); const orders=await readOrders(); const o=orders.find(x=>x.id===orderId); if(!o) return json(res,404,{error:'Order not found'}); return json(res,200,{order:{...o,internal:null}});
  }
  if (req.method==='POST' && url.pathname==='/api/orders') {
    if (!livePaymentsReady) return json(res,503,{error:'Demo preview only. Order placement is not available yet.'});
    const b=await parseBody(req); const p=cfg.products.find(x=>x.id===b.productId); if(!p) return json(res,400,{error:'Invalid product'});
    const currency=b.currency||'NPR'; const total=displayPrice(cfg,p,currency); const order={id:id(),createdAt:new Date().toISOString(),status:'AWAITING_PAYMENT',paymentStatus:'UNPAID',currency,total,productId:p.id,productTitle:p.title,game:p.game,region:p.region,gameData:b.gameData||{},customer:b.customer||{},paymentMethod:b.paymentMethod||'',sourceIp:req.socket.remoteAddress};
    const orders=await readOrders(); orders.push(order); await writeJson(ordersPath,orders); return json(res,201,{order});
  }
  if (req.method==='POST' && url.pathname==='/api/payments/initiate') {
    if (!livePaymentsReady) return json(res,503,{error:'Payments are not enabled. This storefront is currently a preview.'});
    const b=await parseBody(req); const orders=await readOrders(); const order=orders.find(x=>x.id===b.orderId); if(!order) return json(res,404,{error:'Order not found'});
    try { let payment; if(b.provider==='esewa') payment=await createEsewaPayment(order,cfg); else if(b.provider==='khalti') payment=await createKhaltiPayment(order); else payment={type:'manual',message:'This provider needs merchant onboarding/configuration.'}; order.paymentMethod=b.provider; order.paymentStatus='INITIATED'; await writeJson(ordersPath,orders); return json(res,200,{orderId:order.id,payment}); }
    catch(e){ return json(res,400,{error:e.message}); }
  }
  if (req.method==='POST' && url.pathname==='/api/demo/mark-paid') {
    return json(res,503,{error:'Demo preview only. Payments cannot be simulated or collected.'});
  }
  if (req.method==='POST' && url.pathname==='/api/admin/products') {
    const key=req.headers['x-admin-key']; if(!key || key!==process.env.ADMIN_KEY) return json(res,401,{error:'Unauthorized'}); const b=await parseBody(req); if(!b.id||!b.title||!b.game||!b.priceNpr) return json(res,400,{error:'Missing product fields'}); cfg.products.push({...b}); await writeJson(configPath,cfg); return json(res,201,{product:b});
  }
  if (req.method==='POST' && url.pathname==='/api/admin/providers-test') {
    const key=req.headers['x-admin-key']; if(!key || key!==process.env.ADMIN_KEY) return json(res,401,{error:'Unauthorized'}); return json(res,200,{esewaConfigured:Boolean(process.env.ESEWA_PRODUCT_CODE&&process.env.ESEWA_SECRET_KEY),khaltiConfigured:Boolean(process.env.KHALTI_SECRET_KEY),supplierConfigured:Boolean(process.env.SUPPLIER_API_BASE&&process.env.SUPPLIER_API_KEY),demoMode:process.env.DEMO_MODE!=='false'});
  }
  return json(res,404,{error:'Not found'});
}

const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
function contentType(file) { const type=mime[path.extname(file).toLowerCase()]||'application/octet-stream'; return /^(text\/|application\/(javascript|json))/.test(type)?`${type}; charset=utf-8`:type; }
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,`http://${req.headers.host}`);
    if (req.method==='GET' && url.pathname==='/health') return json(res,200,{ok:true});
    if(url.pathname.startsWith('/api/')) return api(req,res,url);
    let file=url.pathname==='/'?'/index.html':url.pathname; if(file==='/admin') file='/admin.html'; const abs=path.join(publicDir,path.normalize(file)); if(!abs.startsWith(publicDir)) return json(res,403,{error:'Forbidden'});
    try {
      const body=await fs.readFile(abs); res.writeHead(200,{'content-type':contentType(abs)}); res.end(body);
    } catch (e) {
      if (!path.extname(url.pathname)) { const body=await fs.readFile(path.join(publicDir,'index.html')); res.writeHead(200,{'content-type':'text/html; charset=utf-8'}); res.end(body); }
      else throw e;
    }
  } catch(e){ res.writeHead(500,{'content-type':'text/plain'}); res.end('Server error'); console.error(e); }
});
await fs.mkdir(dataDir,{recursive:true});
server.listen(PORT,'0.0.0.0',()=>console.log(`NEXA TOPUP running on http://0.0.0.0:${PORT}`));
