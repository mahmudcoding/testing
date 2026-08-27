export default async ({ page }) => {
  const before = await page.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,120));
  const hit = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/return to main|back to main|leave (side )?room|main room/i.test((x.innerText||'')+(x.getAttribute('aria-label')||'')));
    if (!b) return null; const t=(b.innerText||b.getAttribute('aria-label')||'').trim(); b.click(); return t; });
  await page.waitForTimeout(6000);
  return { before, clicked: hit,
    after: await page.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,140)) };
};
