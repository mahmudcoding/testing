export default async ({page}) => {
  const email=process.env.QA_EMAIL, pw=process.env.QA_PW||'QaPass123!';
  // sign out first
  await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.evaluate(`(async()=>{ try{ await fetch('/api/v1/auth/logout',{method:'POST',credentials:'include'}); }catch(e){} })()`);
  await page.context().clearCookies();
  await page.goto('https://airion-cargo.store/login', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', pw);
  await page.click('button[type=submit]');
  await page.waitForTimeout(6000);
  const me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return {s:r.status, email:j?.email||null};})()`);
  return {me, url: page.url().replace(/^https:\/\/[^/]+/,'')};
};
