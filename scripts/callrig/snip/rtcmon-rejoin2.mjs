export default async ({page}) => {
  const steps=[];
  await page.goto('https://staging.airion-cargo.store/w/W4QAF1XTURESO01/call/V4OY2PHMWATYNW0',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const j = page.getByRole('button',{name:/^Join$/}).first();
  if (await j.count()) { await j.click({timeout:10000}).catch(e=>steps.push('err')); }
  await page.waitForTimeout(6000);
  steps.push((await page.evaluate(()=>(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,120))));
  return steps;
};
