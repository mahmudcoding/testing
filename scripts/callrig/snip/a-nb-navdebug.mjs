import { VIS, WS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const CALL = process.env.QA_CALL;
  const out = {net:[]};
  page.on('response', async (r)=>{ const u=r.url(); if(!/\/api\/v1\/(meeting|meetings)/.test(u)) return;
    let b=null; try{b=(await r.text()).slice(0,200);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), body:b}); });
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  out.at3s = await page.evaluate(()=>location.pathname);
  await page.waitForTimeout(7000);
  out.at10s = await page.evaluate(()=>location.pathname);
  out.text = await page.evaluate((v)=>{ const vis=eval(v);
    return (document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,220); }, VIS);
  return out;
}
