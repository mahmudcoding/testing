import { DOM } from './lib.mjs';
// QA_BTN='Decline' — click a visible button by exact aria-label or text, anywhere on the page.
export default async ({page}) => {
  await page.evaluate(DOM);
  const want = process.env.QA_BTN;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,250);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,150),res:b});}});
  const h = await page.evaluateHandle((want)=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const N=(e)=>(e.getAttribute('aria-label')||(e.textContent||'')).replace(/\s+/g,' ').trim();
    const c=[...document.querySelectorAll('button')].filter(vis).filter(b=>N(b)===want);
    return c[0]||null;}, want);
  const el=h.asElement();
  const out={want, found:!!el};
  if(!el) return out;
  const b=await el.boundingBox(); out.clickEpoch=Date.now();
  await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
  await page.waitForTimeout(2000);
  out.dialog = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded')
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const d=ds[0]; if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,300),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(x=>({l:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,40),t:x.getAttribute('data-testid')}))};});
  if (process.env.QA_CONFIRM) {
    const c = await page.$(`[data-testid="${process.env.QA_CONFIRM}"]`);
    out.confirmFound=!!c;
    if (c) { const cb=await c.boundingBox(); await page.mouse.click(cb.x+cb.width/2,cb.y+cb.height/2); out.confirmed=true; await page.waitForTimeout(4000); }
  }
  await page.waitForTimeout(1500);
  out.after = await page.evaluate(()=>{const root=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return (root.innerText||'').replace(/\s+/g,' ').trim().slice(0,400);});
  out.net=net;
  return out;
};
