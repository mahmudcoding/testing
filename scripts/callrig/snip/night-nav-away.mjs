export default async ({page}) => {
  const before=await page.evaluate(()=>({inCall: !!document.querySelector('[data-testid="call-toolbar"]')}));
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return {before, now: page.url(), inCallAfter: await page.evaluate(()=>!!document.querySelector('[data-testid="call-toolbar"]'))};
};
