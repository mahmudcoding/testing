export default async ({ page }) => {
  const net = [];
  page.on('request', r => { if (/\/api\/v1\//.test(r.url()) && r.method() !== 'GET')
    net.push({ m:r.method(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,70),
               post:(r.postData()||'').slice(0,140) }); });
  const clickReal = async (sel) => {
    const box = await page.evaluate(s => { const e=document.querySelector(s);
      if (!e) return null; const r=e.getBoundingClientRect();
      if (r.width===0||r.height===0) return null;
      return { x: r.x + r.width/2, y: r.y + r.height/2 }; }, sel);
    if (!box) return false;
    await page.mouse.move(box.x, box.y); await page.waitForTimeout(200);
    await page.mouse.click(box.x, box.y); return true;
  };
  const state = () => page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    return e ? { checked:e.getAttribute('aria-checked'), visible:e.getBoundingClientRect().width>0 } : 'NOT-FOUND'; });
  // open the settings panel with a real click if needed
  let s = await state();
  if (s === 'NOT-FOUND' || !s.visible) { await clickReal('[data-testid="call-controls-settings-toggle"]');
    await page.waitForTimeout(2200); s = await state(); }
  const before = s;
  const clicked = await clickReal('[data-testid="meeting-settings-approval-toggle"]');
  await page.waitForTimeout(4000);
  const after = await state();
  const server = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); const m = t.match(/"requires_approval":(\w+)/); return m ? m[1] : t.slice(0,60);
  }, process.env.QA_MEETING);
  return { before, realClick: clicked, after, serverRequiresApproval: server, requests: net };
};
