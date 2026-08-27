export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')]
    .find(x=>/notification/i.test(x.getAttribute('aria-label')||'')); if (b) b.click(); });
  await page.waitForTimeout(2500);
  const items = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const cands = [...document.querySelectorAll('li,[role="menuitem"],button,div')].filter(v)
      .filter(e=>/missed call/i.test(e.innerText||'') && (e.innerText||'').length < 160);
    const min = cands.filter(e=>!cands.some(o=>o!==e && e.contains(o)));
    return min.slice(0,4).map(e=>({ tag:e.tagName, text:e.innerText.replace(/\n+/g,' | ').slice(0,110),
                                    clickable: e.tagName==='BUTTON' || !!e.closest('button,[role="menuitem"],a') }));
  });
  return { items };
};
