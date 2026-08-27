export default async ({ page }) => {
  const before = page.url();
  const clicked = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const cands = [...document.querySelectorAll('button')].filter(v)
      .filter(e=>/missed call/i.test(e.innerText||'') && (e.innerText||'').length < 160);
    const min = cands.filter(e=>!cands.some(o=>o!==e && e.contains(o)));
    if (!min[0]) return null;
    const t = min[0].innerText.replace(/\n+/g,' | ').slice(0,80); min[0].click(); return t;
  });
  await page.waitForTimeout(4500);
  return { clicked, before: before.slice(-34), after: await page.evaluate(() => ({
    url: location.pathname + location.search,
    tail: document.body.innerText.replace(/\n+/g,' | ').slice(-190) })) };
};
