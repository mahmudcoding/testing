export default async ({page}) => {
  const steps = [];
  await page.goto('https://staging.airion-cargo.store/w/W4QAF1XTURESO01/call/V4OY2PHMWATYNW0', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const j = page.getByRole('button', { name: /^Join$/ }).first();
  steps.push('join count: ' + await j.count());
  await j.click({timeout:10000}).catch(e=>steps.push('err '+e.message.split('\n')[0]));
  await page.waitForTimeout(9000);
  steps.push('in call: ' + await page.evaluate(()=>!!document.querySelector('[data-testid="call-controls-leave"]')));
  return steps;
};
