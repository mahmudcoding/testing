import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={}; const msg = process.env.QA_MSG || 'hello';
  await page.evaluate(DOM);
  const open = await page.evaluate(()=>{
    const b=document.querySelector('[data-testid="call-controls-chat-toggle"]');
    return b? b.getAttribute('aria-pressed') : null;
  });
  out.chatPressed = open;
  if (open !== 'true') { await safeClick(page,'[data-testid="call-controls-chat-toggle"]').catch(()=>{}); await page.waitForTimeout(2000); }
  const inp = await page.$('[role=textbox][contenteditable="true"], textarea');
  if (!inp) { out.err='no composer'; return out; }
  await inp.click();
  await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await inp.type(msg);
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.panel = await page.evaluate(()=>{
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return (ov.innerText||'').replace(/\s+/g,' ').slice(-500);
  });
  return out;
};
