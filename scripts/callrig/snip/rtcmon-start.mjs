export default async ({page}) => {
  const steps=[];
  await page.goto('https://staging.airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const sn = page.locator('[data-testid="calls-hub-start-now"]').first();
  steps.push('start-now count: '+await sn.count());
  await sn.click({timeout:10000}).catch(e=>steps.push('err1'));
  await page.waitForTimeout(3500);
  const ti = page.locator('input[aria-label="Call name"]').first();
  if (await ti.count()) await ti.fill('RTCMON-verify').catch(()=>{});
  const sub = page.locator('[data-testid="calls-start-submit"]').first();
  steps.push('submit count: '+await sub.count());
  await sub.click({timeout:10000}).catch(e=>steps.push('err2'));
  await page.waitForTimeout(12000);
  steps.push('url: '+await page.evaluate(()=>location.pathname));
  steps.push('inCall: '+await page.evaluate(()=>!!document.querySelector('[data-testid="call-controls-leave"]')));
  return steps;
};
