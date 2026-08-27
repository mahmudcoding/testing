import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const tid = process.env.QA_TAB_TID || 'header-tab-main-activate';
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  const b = page.locator(`[data-testid="${tid}"]`).first();
  const n = await b.count(); if (n) { await b.click(); await page.waitForTimeout(3500); }
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  await page.waitForTimeout(1200);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {clicked:true, head:(ov.innerText||'').replace(/\s+/g,' ').slice(0,90),
      chat:p?(p.innerText||'').replace(/\s+/g,' ').slice(0,320):null}; }, VIS);
};
