export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(() => {
    const t = document.body.innerText || '';
    return { hasCallAgainText: /Call again/i.test(t) };
  });
  // hover the first history row
  const box = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const rows = [...document.querySelectorAll('button')].filter(v)
      .filter(e=>/·\s*(Ended|Declined|No answer|Canceled|Missed)/i.test(e.innerText||'')
                 && (e.innerText||'').length < 140);
    if (!rows[0]) return null;
    const r = rows[0].getBoundingClientRect();
    return { x: Math.round(r.x + r.width - 40), y: Math.round(r.y + r.height/2),
             text: rows[0].innerText.replace(/\n+/g,' | ').slice(0,60) };
  });
  if (!box) return { error: 'no history rows' };
  await page.mouse.move(box.x, box.y);
  await page.waitForTimeout(1800);
  const onHover = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const all = [...document.querySelectorAll('button,[role="menuitem"],a')].filter(v)
      .map(b=>({ t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26),
                 al:(b.getAttribute('aria-label')||'').slice(0,30) }))
      .filter(b=>b.t||b.al);
    return { total: all.length,
             callAgain: all.filter(b=>/call again|звонить/i.test(b.t+' '+b.al)),
             newSinceHover: all.filter(b=>/again|repeat|redial|call back/i.test(b.t+' '+b.al)),
             bodyHasCallAgain: /Call again/i.test(document.body.innerText||'') };
  });
  return { row: box.text, before, onHover };
};
