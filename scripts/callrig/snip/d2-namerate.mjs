export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1500);
  const res = await page.evaluate(async () => {
    const r=await fetch('/api/v1/auth/me/profile',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'QA Alice'})});
    const hdrs={}; r.headers.forEach((v,k)=>{ if(/retry|rate|limit/i.test(k)) hdrs[k]=v; });
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { status:r.status, body:(await r.text()).slice(0,260), headers:hdrs, nameNow:me.name };
  });
  return res;
};
