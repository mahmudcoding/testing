export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const body={ ...s,
      profile:{ ...(s.profile||{}), jobTitle:'', department:'', pronouns:'', showTimezone:false },
      contacts:{ ...(s.contacts||{}), phone:'', github:'', website:'', linkedin:'' } };
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { put:r.status, profile:a.settings.profile, contacts:a.settings.contacts };
  });
};
