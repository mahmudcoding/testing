import { VIS, WS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.evaluate((v)=>{ const vis=eval(v);
    [...document.querySelectorAll('button')].filter(vis).filter(b=>/^(Dismiss|Close|Back to workspace)$/i.test((b.getAttribute('aria-label')||b.innerText||'').trim())).forEach(b=>b.click()); }, VIS);
  await page.waitForTimeout(1200);
  await page.goto(`https://airion-cargo.store/w/${WS}/directories`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  return {ok:true, path: await page.evaluate(()=>location.pathname)};
}
