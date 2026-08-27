export default async ({page}) => {
  await page.goto('https://staging.airion-cargo.store/login',{waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(3000);
  return await page.evaluate(async()=>{ const r=await fetch('/api/v1/auth/me',{credentials:'include'}); let b=null; try{b=await r.json();}catch{}
    return {status:r.status, email:b&&b.email, url:location.href}; });
};
