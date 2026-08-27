import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const which = process.env.QA_PICK || 'Select microphone';
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator(`button[aria-label="${which}"]`).first().click();
  await page.waitForTimeout(2200);
  const out = await page.evaluate((v)=>{ const vis=eval(v);
    const cls = e => String(e.className && e.className.baseVal!==undefined ? e.className.baseVal : (e.className||''));
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return {err:'no popover'};
    return {rows:[...m.querySelectorAll('button')].filter(vis).map(b=>({
      txt:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,46),
      cls:cls(b).slice(0,110),
      attrs:[...b.attributes].map(a=>a.name+'='+String(a.value).slice(0,24)).filter(a=>!/^class=/.test(a)),
      svgs:[...b.querySelectorAll('svg')].map(s=>cls(s).slice(0,40))})).slice(0,9)}; }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
