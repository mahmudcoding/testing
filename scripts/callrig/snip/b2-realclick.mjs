export default async ({ page }) => {
  const label = process.env.QA_LABEL;
  const box = await page.evaluate(l => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x => ((x.getAttribute('aria-label')||'') + ' ' + (x.innerText||'')).replace(/\s+/g,' ').trim() === l
              || (x.innerText||'').trim() === l || (x.getAttribute('aria-label')||'').trim() === l);
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width/2, y: r.y + r.height/2, t: (b.innerText||b.getAttribute('aria-label')||'').trim().slice(0,30) };
  }, label);
  if (!box) return { error: 'not found: ' + label };
  await page.mouse.move(box.x, box.y); await page.waitForTimeout(250);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(7000);
  return { clicked: box.t,
    inRoom: await page.evaluate(() => /Leave Side Room/i.test(document.body.innerText||'')),
    hasLeaveCall: await page.evaluate(() => {
      const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
      return [...document.querySelectorAll('button')].filter(v)
        .some(x => /^Leave call$/i.test((x.innerText||x.getAttribute('aria-label')||'').trim())); }),
    tail: await page.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(-130)) };
};
