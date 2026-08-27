export default async ({ page }) => {
  const tid = process.env.QA_TID, want = process.env.QA_WANT; // 'true' | 'false'
  const vis = () => page.evaluate(t => { const e=document.querySelector(`[data-testid="${t}"]`);
    return e ? e.getBoundingClientRect().width > 0 : false; }, tid);
  for (let i = 0; i < 3 && !(await vis()); i++) {
    await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); if(b) b.click(); });
    await page.waitForTimeout(2000);
  }
  if (!(await vis())) return { error: 'settings panel would not open' };
  const state = () => page.evaluate(t => document.querySelector(`[data-testid="${t}"]`).getAttribute('aria-checked'), tid);
  const before = await state();
  if (before !== want) {
    await page.evaluate(t => document.querySelector(`[data-testid="${t}"]`).click(), tid);
    await page.waitForTimeout(3000);
  }
  const after = await state();
  const server = await page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}/settings`, {credentials:'include'});
    const t = await r.text(); const m = t.match(/"chat_enabled":(\w+)/); return m ? m[1] : t.slice(0,60);
  }, process.env.QA_MEETING);
  return { before, after, serverChatEnabled: server };
};
