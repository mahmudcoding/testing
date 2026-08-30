import { DOM } from './lib.mjs';
// QA_TID='header-tab-main-activate'
export default async ({page}) => {
  await page.evaluate(DOM);
  const tid = process.env.QA_TID;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,250);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,150),res:b});}});
  const el = await page.$(`[data-testid="${tid}"]`);
  const out={tid, found:!!el};
  if(!el) return out;
  const b=await el.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
  await page.waitForTimeout(4000);
  out.after = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const root=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {text:(root.innerText||'').replace(/\s+/g,' ').trim().slice(0,500),
      btns:[...root.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean)};});
  out.net=net;
  return out;
};
