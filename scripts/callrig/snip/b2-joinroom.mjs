export default async ({ page }) => {
  // a participant joins an open public side room from the Side Rooms panel
  await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-breakout-rooms"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const opts = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return [...document.querySelectorAll('button')].filter(v)
      .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26), tid:b.getAttribute('data-testid')}))
      .filter(b=>/join|room/i.test(b.t + ' ' + (b.tid||''))); });
  const hit = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/^Join$/i.test((x.innerText||'').trim()) || /side-room-join/.test(x.getAttribute('data-testid')||''));
    if (!b) return null; const t=(b.innerText||b.getAttribute('data-testid')).trim(); b.click(); return t; });
  await page.waitForTimeout(7000);
  return { options: opts.slice(0,8), clicked: hit,
    state: await page.evaluate(() => (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,150)) };
};
