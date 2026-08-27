export default async ({ page }) => {
  const u = page.url();
  const me = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return {status:r.status};
    const p=await r.json(); return {email:p.email, lang:p.settings?.language};
  });
  return { url: u.replace('https://airion-cargo.store',''), ...me };
};
