export default async ({ page }) => {
  const net = [];
  page.on('request', r => { if (/\/api\/v1\//.test(r.url()) && r.method() !== 'GET')
    net.push({ m:r.method(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,60), post:(r.postData()||'').slice(0,160) }); });
  const clickReal = async (sel) => {
    const box = await page.evaluate(s => { const e=document.querySelector(s); if(!e) return null;
      const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return null;
      return { x:r.x+r.width/2, y:r.y+r.height/2 }; }, sel);
    if (!box) return false;
    await page.mouse.move(box.x, box.y); await page.waitForTimeout(180);
    await page.mouse.click(box.x, box.y); return true; };
  const st = () => page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    return e ? e.getAttribute('aria-checked') : 'NOT-FOUND'; });
  const before = await st();
  const t1 = before === 'false' ? await clickReal('[data-testid="meeting-settings-approval-toggle"]') : 'already-on';
  await page.waitForTimeout(1200);
  const afterToggle = await st();
  const saved = await clickReal('[data-testid="meeting-settings-save"]');
  await page.waitForTimeout(4000);
  const server = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); const m = t.match(/"requires_approval":(\w+)/); return m ? m[1] : t.slice(0,60);
  }, process.env.QA_MEETING);
  return { before, toggled: t1, afterToggle, savePressed: saved, serverRequiresApproval: server, requests: net };
};
