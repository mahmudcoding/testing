export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(800);
  return await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return { status:r.status };
    const j=await r.json();
    return { status:200, email:j.email, name:j.name, lang:(j.settings&&j.settings.language)||null };})()`);
};
