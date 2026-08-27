export default async ({ page }) => {
  const box = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x => /^Participant actions for/i.test(x.getAttribute('aria-label')||''));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width/2, y: r.y + r.height/2, al: b.getAttribute('aria-label') };
  });
  if (!box) return { error: 'no participant actions button' };
  await page.mouse.move(box.x, box.y); await page.waitForTimeout(200);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(2500);
  return { opened: box.al, items: await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(v)
      .map(b=>({ t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,34), dis:b.getAttribute('aria-disabled')==='true'||b.disabled }));
  }) };
};
