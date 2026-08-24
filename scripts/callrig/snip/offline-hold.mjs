export default async ({page, ctx}) => {
  await ctx.setOffline(true);
  await page.waitForTimeout(Number(process.env.QA_HOLD||25000));
  const s = await page.evaluate(()=>({online:navigator.onLine, ind:(document.querySelector('[data-testid="call-network-indicator"]')||{innerText:''}).innerText.replace(/\n+/g,' ')}));
  await ctx.setOffline(false);
  return s;
};
