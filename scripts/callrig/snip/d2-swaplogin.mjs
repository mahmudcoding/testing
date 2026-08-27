export default async ({ page }) => {
  const EMAIL = process.env.D2_EMAIL;
  await page.context().clearCookies();
  await page.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', 'QaPass123!');
  await page.locator('button[type=submit], button:has-text("Sign in")').first().click().catch(()=>{});
  for (let i=0;i<20;i++){ const busy=await page.evaluate(`(()=>/Signing in/i.test(document.body.innerText))()`); if(!busy) break; await page.waitForTimeout(500); }
  await page.waitForTimeout(3000);
  const who = await page.evaluate(async () => { const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return 'NOT SIGNED IN ('+r.status+')'; const j=await r.json(); return (j.user||j).email; });
  return { signedInAs: who, url: page.url().replace(/^https?:\/\/[^/]+/,'') };
};
