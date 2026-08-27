export default async ({page, ctx}) => {
  await ctx.clearCookies();
  await page.goto('https://airion-cargo.store/login');
  await page.evaluate(()=>{ try{localStorage.clear(); sessionStorage.clear();}catch(e){} });
  await page.goto('https://airion-cargo.store/login');
  await page.waitForTimeout(3000);
  const inputs=page.locator('input:visible');
  const n=await inputs.count();
  if(n<2) return {err:'no form', n};
  await inputs.nth(0).fill(process.env.QA_EMAIL);
  await inputs.nth(1).fill('QaPass123!');
  await page.locator('button[type="submit"]:visible').first().click();
  await page.waitForTimeout(7000);
  const me=await page.evaluate(async()=>{try{return (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email;}catch(e){return 'ERR';}});
  return {me, url:page.url(),
    ls: await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('saved')))};
};
