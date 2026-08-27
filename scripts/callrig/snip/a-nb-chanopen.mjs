import { VIS, WS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const ch = process.env.QA_CHAN || 'C4QAGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${ch}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate((v)=>{ const vis=eval(v);
    return {path:location.pathname,
      btns:[...document.querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().replace(/\s+/g,' ').slice(0,30))
        .filter(x=>/call|Call|звон/.test(x)).slice(0,10),
      head:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,120)};}, VIS);
};
