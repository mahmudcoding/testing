import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const which = process.env.QA_PICK || 'Select microphone';
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{});
  const b = page.locator(`button[aria-label="${which}"]`).first();
  if (!(await b.count())) return {err:'no button '+which};
  await b.click(); await page.waitForTimeout(2000);
  const menu = await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-menu-content]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    const r=m.getBoundingClientRect();
    return {rect:`${Math.round(r.width)}x${Math.round(r.height)}`,
      overflow:{sh:m.scrollHeight, ch:m.clientHeight},
      txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,240),
      items:[...m.querySelectorAll('[role="menuitem"],[role="menuitemradio"],[role="option"],button')].filter(vis)
        .map(i=>({l:(i.getAttribute('aria-label')||i.textContent||'').trim().slice(0,44),
                  sel:i.getAttribute('aria-checked')||i.getAttribute('aria-selected')||null}))}; }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return menu;
};
