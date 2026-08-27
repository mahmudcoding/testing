import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(400);
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(2200);
  const out = await page.evaluate((v)=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return {err:'no popover'};
    return {full:(m.innerText||'').replace(/\n/g,' | ').slice(0,400),
      sliders:[...m.querySelectorAll('input[type=range],[role="slider"]')].filter(vis)
        .map(s=>({t:s.getAttribute('data-testid'), al:s.getAttribute('aria-label'),
                  val:s.value!==undefined?s.value:s.getAttribute('aria-valuenow'),
                  min:s.min, max:s.max}))}; }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
