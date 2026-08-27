export default async ({page}) => {
  const email=process.env.QA_EMAIL, pass='QaPass123!';
  await page.goto('https://airion-cargo.store/login');
  await page.waitForTimeout(2500);
  const inputs=page.locator('input:visible');
  const n=await inputs.count();
  if (n<2) return {err:'login form not found', n, url:page.url(),
    fields: await page.evaluate(()=>[...document.querySelectorAll('input')].map(i=>i.type+'/'+(i.name||i.getAttribute('aria-label')||'')))};
  await inputs.nth(0).fill(email);
  await inputs.nth(1).fill(pass);
  const btn=page.locator('button[type="submit"]:visible').first();
  await btn.click();
  await page.waitForTimeout(6000);
  const me=await page.evaluate(async()=>{ try{return (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email;}catch(e){return 'ERR';} });
  return {me, url:page.url()};
};
