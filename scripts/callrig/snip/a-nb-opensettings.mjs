import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (!(await t.count())) return {err:'no settings toggle'};
  const pressed = await t.getAttribute('aria-pressed');
  if (pressed !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {open: !!(p && /Meeting settings/.test(p.innerText||'')),
            txt: p?(p.innerText||'').replace(/\s+/g,' ').slice(0,120):null}; }, VIS);
}
