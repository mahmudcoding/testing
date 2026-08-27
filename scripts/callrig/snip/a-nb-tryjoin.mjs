import { VIS, WS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const CALL = process.env.QA_CALL;
  const out={net:[]};
  page.on('response', async r=>{ if(r.request().method()==='GET')return; if(!/\/api\/v1\//.test(r.url()))return;
    let b=null; try{b=(await r.text()).slice(0,240);}catch(e){}
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),body:b}); });
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const j = page.locator('button',{hasText:/^Join$/}).first();
  out.joinBtn = await j.count();
  if (out.joinBtn) { await j.click(); await page.waitForTimeout(8000); }
  out.screen = await page.evaluate((v)=>{ const vis=eval(v);
    return {path:location.pathname,
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,240),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean).slice(0,14)};}, VIS);
  return out;
};
