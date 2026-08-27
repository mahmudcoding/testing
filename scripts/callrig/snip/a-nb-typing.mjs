import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2000); }
  const ed = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const e=[...p.querySelectorAll('[contenteditable="true"],textarea')].filter(vis)[0];
    if(!e) return {err:'no composer'}; e.focus(); return {ok:true}; }, VIS);
  if (ed.err) return ed;
  await page.keyboard.type('typing test', {delay:120});
  await page.waitForTimeout(2500);
  return {ok:true};
}
