export default async ({ page }) => {
  const VIS_FIELD = process.env.D2_VIS || 'everyone';
  const HIDE = process.env.D2_HIDE;   // 'true' | 'false' | unset
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(`(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const put=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...s, privacy:{...(s.privacy||{}), online_visibility:${JSON.stringify(process.env.D2_VIS||'everyone')}}})});
    let hide=null;
    if (${JSON.stringify(process.env.D2_HIDE||'')} !== '') {
      const r=await fetch('/api/v1/users/me/presence-settings/update',{method:'POST',credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({hide_presence: ${JSON.stringify(process.env.D2_HIDE||'false')} === 'true'})});
      hide={s:r.status,b:(await r.text()).slice(0,100)};
    }
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ps=await (await fetch('/api/v1/users/me/presence-settings',{credentials:'include'})).text();
    return { put:put.status, online_visibility:(back.settings||{}).privacy.online_visibility,
             hideCall:hide, presenceSettings:ps.slice(0,90) };
  })()`);
};
