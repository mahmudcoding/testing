export default async ({page}) => {
  const b = await page.$('[data-testid="call-ended-close"]');
  if (b) { await b.click().catch(()=>{}); await page.waitForTimeout(1500); }
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>document.querySelector('main').innerText.replace(/\n+/g,' | ').slice(0,200));
};
