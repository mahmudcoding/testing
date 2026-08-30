import { DOM } from './lib.mjs';
// QA_ROOM='SR Beta' QA_BTN='Close room'  — press a control on a room row (or the toolbar's room controls).
export default async ({page}) => {
  await page.evaluate(DOM);
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,250);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,150),res:b});}});
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const sb = await page.$('button[aria-label="Side Rooms"]');
  if (sb && (await sb.getAttribute('aria-pressed'))!=='true') { const bb=await sb.boundingBox(); await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); await page.waitForTimeout(2200); }
  const want = process.env.QA_BTN || 'Close room';
  const room = process.env.QA_ROOM || '';
  const h = await page.evaluateHandle(([room,want])=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const N=(e)=>(e.getAttribute('aria-label')||T(e)||'').trim();
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0]; if(!p) return null;
    if (!room) return [...p.querySelectorAll('button')].filter(vis).find(b=>N(b)===want)||null;
    let best=null,bl=1e9;
    for(const e of p.querySelectorAll('*')){const t=T(e); if(!t.includes(room))continue;
      const j=[...e.querySelectorAll('button')].filter(vis).find(b=>N(b)===want); if(!j)continue;
      if(t.length<bl){bl=t.length;best=j;}}
    return best;}, [room,want]);
  const el=h.asElement();
  const out={btnFound:!!el, want, room};
  if(!el){ out.panel = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return p?{text:(p.innerText||'').replace(/\s+/g,' ').trim(), btns:[...p.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim())}:null;}); return out; }
  const b=await el.boundingBox(); out.clickEpoch=Date.now();
  await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
  await page.waitForTimeout(1800);
  out.dialog = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0]; if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,400),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(x=>({l:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,40), t:x.getAttribute('data-testid')}))};});
  if (process.env.QA_CONFIRM) {
    const c = await page.$(`[data-testid="${process.env.QA_CONFIRM}"]`);
    out.confirmFound = !!c;
    if (c) { const cb=await c.boundingBox(); await page.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2); await page.waitForTimeout(4000); out.confirmed=true; }
  }
  out.after = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return {url:location.pathname, panel:p?(p.innerText||'').replace(/\s+/g,' ').trim():null};});
  out.net=net;
  return out;
};
