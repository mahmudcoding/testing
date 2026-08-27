export default async ({ page }) => {
  const t0 = Date.now(); let hit = null;
  while ((Date.now()-t0) < 25000 && !hit) {
    hit = await page.evaluate(() => {
      const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
      const b = [...document.querySelectorAll('button')].filter(v)
        .find(x=>/accept/i.test((x.getAttribute('data-testid')||'')+(x.getAttribute('aria-label')||'')+x.textContent));
      if (!b) return null; b.click(); return b.textContent.trim() || b.getAttribute('data-testid');
    }).catch(()=>null);
    if (!hit) await page.waitForTimeout(400);
  }
  await page.waitForTimeout(6000);
  return { accepted: hit, inCall: await page.evaluate(()=>!!document.querySelector('[data-testid="call-surface"]')) };
};
