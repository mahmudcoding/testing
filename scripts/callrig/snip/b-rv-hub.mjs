export default async ({page}) => {
  await page.goto('https://staging.airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const btns = [...document.querySelectorAll('button,a[href]')].filter(vis)
      .map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,50), al:b.getAttribute('aria-label'), tid:b.getAttribute('data-testid')}))
      .filter(b=>b.t||b.al);
    return { url: location.href, count: btns.length, btns, head: document.querySelector('main')?.innerText.replace(/\s+/g,' ').slice(0,600) };
  });
};
