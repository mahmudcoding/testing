export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const body={ ...s,
      profile:{ ...(s.profile||{}), jobTitle:'D2 QA Engineer', department:'D2 Quality',
                pronouns:'they/them', showTimezone:true },
      contacts:{ ...(s.contacts||{}), phone:'+998901234567', github:'d2probe',
                 website:'https://example.invalid', linkedin:'d2probe' } };
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const after=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { put:r.status, savedProfile:after.settings.profile, savedContacts:after.settings.contacts };
  });
};
