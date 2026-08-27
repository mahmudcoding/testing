export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { if (/\/settings/.test(r.url()) && r.request().method()!=='GET') {
    let b=''; try { b=(await r.text()).slice(0,150); } catch {}
    net.push({st:r.status(), m:r.request().method(), body:b}); } });
  const isOpen = () => page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    return e ? e.getBoundingClientRect().width > 0 : false; });
  let open = await isOpen();
  for (let i=0; i<3 && !open; i++) {
    await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); if(b) b.click(); });
    await page.waitForTimeout(1800); open = await isOpen();
  }
  const before = await page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    return e ? e.getAttribute('aria-checked') : 'NOT-FOUND'; });
  if (open && before === 'false') {
    await page.evaluate(() => document.querySelector('[data-testid="meeting-settings-approval-toggle"]').click());
    await page.waitForTimeout(3500);
  }
  const after = await page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    return e ? e.getAttribute('aria-checked') : 'NOT-FOUND'; });
  const server = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); const m = t.match(/"requires_approval":(\w+)/); return m ? m[1] : t.slice(0,60);
  }, process.env.QA_MEETING);
  return { panelOpen: open, before, after, net, serverRequiresApproval: server };
};
