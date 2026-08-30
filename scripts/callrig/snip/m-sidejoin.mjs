import { DOM } from './lib.mjs';
// QA_ROOM='SR Alpha' — click the Join button on that room's row in the Side Rooms panel.
export default async ({page}) => {
  await page.evaluate(DOM);
  const room = process.env.QA_ROOM || 'SR Alpha';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,300);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,200),res:b});}});
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const sb = await page.$('button[aria-label="Side Rooms"]');
  if (sb && (await sb.getAttribute('aria-pressed'))!=='true') { const bb=await sb.boundingBox(); await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); await page.waitForTimeout(2200); }
  const h = await page.evaluateHandle((room)=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0]; if(!p) return null;
    // smallest element containing the room name and a Join button
    let best=null,bl=1e9;
    for(const e of p.querySelectorAll('*')){const t=T(e); if(!t.includes(room))continue;
      const j=[...e.querySelectorAll('button')].filter(vis).find(b=>/^(Join|Rejoin)$/.test(T(b))); if(!j)continue;
      if(t.length<bl){bl=t.length;best=j;}}
    return best;}, room);
  const el=h.asElement();
  const out={joinFound:!!el};
  if(!el){ out.panel = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return p?(p.innerText||'').replace(/\s+/g,' ').trim():null;}); return out; }
  const b=await el.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return {url:location.pathname, panel:p?T(p):null,
      header: (()=>{const h=document.querySelector('header'); return h?T(h).slice(0,120):null;})(),
      toolbar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(-14)};});
  out.net=net;
  return out;
};
