export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  return await page.evaluate(()=>({url:location.pathname}));
};
