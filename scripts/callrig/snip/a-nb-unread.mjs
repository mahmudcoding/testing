import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const act = process.env.QA_ACT || 'read';   // read | open | close
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (act==='open' && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  if (act==='close' && (await t.getAttribute('aria-pressed'))==='true'){ await t.click(); await page.waitForTimeout(1500); }
  await page.mouse.move(700,500); await page.waitForTimeout(500);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const s=document.querySelector('[data-testid="call-controls-chat-unread-count"]');
    const b=document.querySelector('[data-testid="call-controls-chat-toggle"]');
    return {badge: s? (s.textContent||'').trim() : null, badgeVisible: s? vis(s) : false,
            panelOpen: b?b.getAttribute('aria-pressed'):null}; }, VIS);
};
