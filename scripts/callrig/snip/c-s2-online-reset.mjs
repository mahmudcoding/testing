export default async ({page, ctx}) => {
  await ctx.setOffline(false);
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/C4OX0TTLIMVOUBH');
  await page.waitForTimeout(6000);
  return page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    return {online:navigator.onLine, meStatus:r.status};});
};
