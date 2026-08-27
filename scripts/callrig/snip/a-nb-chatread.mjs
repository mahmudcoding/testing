import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2200); }
  return await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    return {header:(p.innerText||'').replace(/\s+/g,' ').slice(0,420)}; }, VIS);
}
