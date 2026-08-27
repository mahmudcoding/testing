export default async ({ page }) => {
  return await page.evaluate(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const prof={...(cur.settings?.profile||{}), jobTitle:'QA Engineer', pronouns:'they/them',
                department:'Quality', showTimezone:true};
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({...cur.settings, profile:prof})});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    // status message is separate
    const st=await fetch('/api/v1/users/me/status',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({text:'QA control field'})});
    return { put:r.status, profileNow: back.settings?.profile, statusPut: st.status };
  });
};
