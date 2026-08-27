export default async ({ page }) => {
  return await page.evaluate(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({...cur.settings, online_visibility:'nobody'})});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ps=await (await fetch('/api/v1/users/me/presence-settings',{credentials:'include'})).json();
    return { put:r.status, online_visibility: back.settings?.online_visibility, presenceSettings: ps };
  });
};
