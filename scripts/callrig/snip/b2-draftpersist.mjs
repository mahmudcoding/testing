export default async ({ page }) => {
  const clickReal = async (sel) => {
    const box = await page.evaluate(s => { const e=document.querySelector(s); if(!e) return null;
      const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return null;
      return { x:r.x+r.width/2, y:r.y+r.height/2 }; }, sel);
    if (!box) return false;
    await page.mouse.move(box.x, box.y); await page.waitForTimeout(180);
    await page.mouse.click(box.x, box.y); return true; };
  const st = () => page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    return e ? { checked:e.getAttribute('aria-checked'), visible:e.getBoundingClientRect().width>0 } : 'GONE'; });
  const srv = () => page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); const m = t.match(/"requires_approval":(\w+)/); return m ? m[1] : '?';
  }, process.env.QA_MEETING);
  const out = { start: { ui: await st(), server: await srv() } };
  await clickReal('[data-testid="meeting-settings-approval-toggle"]');
  await page.waitForTimeout(1200);
  out.afterToggleUnsaved = { ui: await st(), server: await srv() };
  // dismiss the panel with the toolbar button, NOT Cancel
  await clickReal('[data-testid="call-controls-settings-toggle"]');
  await page.waitForTimeout(1800);
  out.panelClosed = await st();
  await clickReal('[data-testid="call-controls-settings-toggle"]');
  await page.waitForTimeout(2500);
  out.afterReopen = { ui: await st(), server: await srv() };
  return out;
};
