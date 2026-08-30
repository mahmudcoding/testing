export default async ({page}) => {
  const out={};
  out.logout = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/logout',{method:'POST',credentials:'include'});
    return {s:r.status, b:(await r.text()).slice(0,120)};
  });
  await page.evaluate(()=>{ try{localStorage.clear(); sessionStorage.clear();}catch(e){} });
  await page.context().clearCookies().catch(()=>{});
  await page.goto('https://airion-cargo.store/login',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  out.me = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'}); return {s:r.status,b:(await r.text()).slice(0,120)};});
  out.url = page.url();
  return out;
};
