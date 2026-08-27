export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/users/me/status',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:'',emoji:'',expires_at:null})});
    const a=await r.text();
    const r2=await fetch('/api/v1/users/U4QEALICE000001/status',{credentials:'include'});
    return {put:r.status, putBody:a.slice(0,90), now:(await r2.text()).slice(0,90)}; })()`);
};
