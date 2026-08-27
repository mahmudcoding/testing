export default async ({ page }) => {
  return await page.evaluate(async()=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ns=await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json();
    return { who:me.email, language:me.settings?.language, timezone:me.timezone,
             profile:me.settings?.profile, notifications:ns };
  });
};
