export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1200);
  return await page.evaluate(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const body={...s,
      profile:{...(s.profile||{}), jobTitle:'', department:'', pronouns:'', showTimezone:false},
      privacy:{...(s.privacy||{}), online_visibility:'everyone', profile_visibility:'everyone',
               last_seen_visibility:'everyone', read_receipts:true}};
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const n=await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json();
    return { put:r.status, profile:(back.settings||{}).profile, privacy:(back.settings||{}).privacy, notif:n };
  });
};
