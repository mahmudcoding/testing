export default async ({ page }) => {
  const V = process.env.D2_VIS || 'everyone';
  const F = process.env.D2_FIELD || 'profile_visibility';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1200);
  return await page.evaluate(`(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const body={...s, privacy:{...(s.privacy||{}), ${JSON.stringify(process.env.D2_FIELD||'profile_visibility')}:${JSON.stringify(process.env.D2_VIS||'everyone')}}};
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { status:r.status, privacyNow:(back.settings||{}).privacy };
  })()`);
};
