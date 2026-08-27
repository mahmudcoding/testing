import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  // rejoin if a Join button is offered
  const j = page.locator('button',{hasText:/^Join$/}).first();
  const had = await j.count();
  if (had) { await j.click(); await page.waitForTimeout(8000); }
  await page.mouse.move(700,400); await page.waitForTimeout(600);
  const st = await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const tiles=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis).map(t=>{
      const r=t.getBoundingClientRect();
      return {who:(t.querySelector('[data-testid="participant-name"]')?.textContent||'').trim(),
        box:`${Math.round(r.width)}x${Math.round(r.height)}`,
        marks:[...t.querySelectorAll('[data-testid]')].map(y=>y.getAttribute('data-testid')).filter(x=>/pin|speaking/.test(x))};});
    const tog=[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim())
      .filter(x=>/view$|pinned|fullscreen/i.test(x));
    return {path:location.pathname, tiles, tog};}, VIS);
  return {joinBtn:had, ...st};
};
