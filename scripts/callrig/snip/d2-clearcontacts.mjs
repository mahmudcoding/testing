export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...s, contacts:{phone:'',github:'',website:'',linkedin:''}})});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { put:r.status, contacts:(back.settings||{}).contacts, profile:(back.settings||{}).profile };
  });
};
