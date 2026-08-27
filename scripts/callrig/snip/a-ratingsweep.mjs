const sweep = () => {
  const b = document.body;
  return {
    url: location.href,
    starEls: [...b.querySelectorAll('[aria-label*="star" i],[data-testid*="rat" i],[class*="star" i]')].map(e=>({tag:e.tagName, al:e.getAttribute('aria-label'), tid:e.getAttribute('data-testid')})).slice(0,10),
    ratingWords: (b.innerText.match(/[^|\n]{0,30}(rating|Rating|RATE|quality|Quality)[^|\n]{0,40}/g)||[]).slice(0,6)
  };
};
export default async ({page}) => {
  const out = {};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  out.hub = await page.evaluate(sweep);
  // open the row of our call from recents
  const row = page.locator('main :text("QA-A-RATE")').first();
  if (await row.count()) { await row.click(); await page.waitForTimeout(3500); }
  out.afterRowClick = await page.evaluate(sweep);
  out.rowText = await page.evaluate(()=> (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,600));
  return out;
};
