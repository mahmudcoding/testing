export default async ({page}) => {
  const WS = 'W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const snap = () => page.evaluate(() => {
    const all = [...document.querySelectorAll('button,a[role=button],[type=submit]')].map(b=>({
      l:(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,45), d:b.disabled,
      vis: !!(b.offsetParent||b.getClientRects().length)
    })).filter(x=>x.l && x.vis);
    return {
      title: document.title,
      mainText: (document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,700),
      buttons: all.slice(0,40)
    };
  });
  const before = await snap();
  await page.evaluate(() => { const m=document.querySelector('main')||document.body; [...m.querySelectorAll('[role="switch"]')][0].click(); });
  await page.waitForTimeout(1500);
  const after = await snap();
  return {before, after};
};
