export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {m, s:r.status, t:(await r.text()).slice(0,90)};};
    const out=[];
    out.push(await call('DELETE','/api/v1/users/me/status'));
    let me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    if ((me.custom_status||{}).text) out.push(await call('PUT','/api/v1/users/me/status',{text:null,expires_at:null}));
    me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { attempts:out, statusNow:(me.custom_status||{}).text||null };
  });
};
