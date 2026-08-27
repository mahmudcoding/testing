export default async ({ page }) => {
  return await page.evaluate(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const prof={...(cur.settings?.profile||{}), jobTitle:'', pronouns:'', department:'', showTimezone:false};
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({...cur.settings, profile:prof})});
    const del=await fetch('/api/v1/users/me/status',{method:'DELETE',credentials:'include'});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { put:r.status, statusDelete:del.status, profileNow: back.settings?.profile };
  });
};
