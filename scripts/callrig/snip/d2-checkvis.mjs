export default async ({ page }) => {
  return await page.evaluate(async()=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ps=await (await fetch('/api/v1/users/me/presence-settings',{credentials:'include'})).json();
    return { online_visibility: me.settings?.online_visibility ?? '(absent)',
             profile_visibility: me.settings?.profile_visibility ?? '(absent)',
             last_seen_visibility: me.settings?.last_seen_visibility ?? '(absent)',
             presence: ps, allSettingKeys: Object.keys(me.settings||{}) };
  });
};
