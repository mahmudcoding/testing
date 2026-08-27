export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance', { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  return await page.evaluate(`(async()=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const raw=localStorage.getItem('aloqa.appearance');
    const keys=Object.keys(localStorage).filter(k=>/aloqa/i.test(k)).slice(0,8);
    return { who:me.email.split('@')[0], rawPresent: raw!==null,
             raw: raw? raw.slice(0,150):null, aloqaKeys:keys };})()`);
};
