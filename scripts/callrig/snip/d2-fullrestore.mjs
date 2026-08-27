export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const n=await fetch('/api/v1/auth/me/profile',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'QA Alice'})});
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const p=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...s, profile:{jobTitle:'',department:'',pronouns:'',showTimezone:false,awayWhenInactive:false},
                           contacts:{phone:'',github:'',website:'',linkedin:''}})});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { namePatch:n.status, settingsPut:p.status, name:back.name,
             profile:(back.settings||{}).profile, contacts:(back.settings||{}).contacts };
  });
};
