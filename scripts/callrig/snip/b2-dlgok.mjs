export default async ({ page }) => {
  const want = process.env.QA_OK || 'Leave room';
  const box = await page.evaluate(w => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    if (!d) return null;
    const b = [...d.querySelectorAll('button')].filter(v).find(x => (x.innerText||'').trim() === w);
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width/2, y: r.y + r.height/2, t: b.innerText.trim() };
  }, want);
  if (!box) return { error: 'no dialog button ' + want };
  await page.mouse.move(box.x, box.y); await page.waitForTimeout(200);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(7000);
  return { confirmed: box.t, ...(await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const ctl = [...document.querySelectorAll('button')].filter(v)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim());
    return { hasLeaveCall: ctl.some(t=>/^Leave call$/i.test(t)),
             inSideRoom: ctl.some(t=>/Leave Side Room/i.test(t)),
             url: location.pathname.slice(-28) }; })) };
};
