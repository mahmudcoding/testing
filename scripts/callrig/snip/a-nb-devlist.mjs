import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const which = process.env.QA_PICK || 'Select microphone';
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator(`button[aria-label="${which}"]`).first().click();
  await page.waitForTimeout(2200);
  const out = await page.evaluate((v)=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return {err:'no popover'};
    const r=m.getBoundingClientRect();
    return {box:`${Math.round(r.width)}x${Math.round(r.height)}`,
      overflow:{sh:m.scrollHeight, ch:m.clientHeight, css:getComputedStyle(m).overflowY},
      full:(m.innerText||'').replace(/\n/g,' | ').slice(0,600),
      items:[...m.querySelectorAll('button,[role="menuitem"],[role="menuitemradio"],[role="option"]')].filter(vis)
        .map(i=>({l:(i.innerText||'').replace(/\s+/g,' ').trim().slice(0,60),
                  sel:i.getAttribute('aria-checked')||i.getAttribute('aria-selected')||i.getAttribute('data-state')||null}))}; }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
