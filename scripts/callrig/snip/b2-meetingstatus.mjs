export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/directories?tab=people',
                  {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const t = document.body.innerText || '';
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const rows = [...document.querySelectorAll('li,tr,div')].filter(v)
      .filter(e=>/In a meeting|In a call|On a call/i.test(e.innerText||'') && (e.innerText||'').length < 160);
    const min = rows.filter(e=>!rows.some(o=>o!==e && e.contains(o)));
    return { hasMeetingStatus: /In a meeting|In a call|On a call/i.test(t),
             bodyLen: t.length,
             rows: min.slice(0,5).map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,80)) };
  });
};
