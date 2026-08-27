export default async ({page, pages, ctx}) => {
  const before=await page.evaluate(()=>({url:location.href, inCall: !!document.querySelector('[data-testid="call-toolbar"]')}));
  // navigate away hard (simulates the tab going away from the call)
  await page.evaluate(()=>{ window.stop(); });
  await page.goto('about:blank');
  await page.waitForTimeout(1000);
  return {before, now: page.url()};
};
