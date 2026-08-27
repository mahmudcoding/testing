export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const body={...s,
      profile:{...(s.profile||{}), jobTitle:'QA Engineer', department:'Quality', pronouns:'they/them', showTimezone:true},
      contacts:{...(s.contacts||{}), phone:'+998 90 000-00-00', github:'octocat', website:'https://example.org', linkedin:'in/example'}};
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { put:r.status, profile:(back.settings||{}).profile, contacts:(back.settings||{}).contacts };
  });
};
