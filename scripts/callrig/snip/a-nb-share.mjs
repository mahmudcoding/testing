import { VIS } from './a-nb-lib.mjs';
import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const out = {};
  const b = page.locator('[data-testid="call-controls-screen-share"]').first();
  if (!(await b.count())) return {err:'no share button'};
  out.before = await b.getAttribute('aria-pressed');
  out.label = await b.getAttribute('aria-label');
  await b.click();
  await page.waitForTimeout(7000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const btn=document.querySelector('[data-testid="call-controls-screen-share"]');
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).filter(x=>[...x.querySelectorAll('button')].filter(vis).length<=8).pop();
    return {pressed:btn?btn.getAttribute('aria-pressed'):null, label:btn?btn.getAttribute('aria-label'):null,
      dlg: d?(d.innerText||'').replace(/\s+/g,' ').slice(0,200):null}; }, VIS);
  const s = await page.evaluate('('+RTC_STATS+')()');
  out.gdm = s.gdm;
  out.out = s.stats.flatMap(x=>x.out.map(o=>`${o.kind} b=${o.bytes} fenc=${o.framesEnc??'-'} ${o.w||''}x${o.h||''}`));
  return out;
}
