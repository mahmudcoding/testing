export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=me.settings||{};
    const n=await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json();
    let app=null; try{app=JSON.parse(localStorage.getItem('aloqa.appearance'));}catch{}
    return { name:me.name, profile:s.profile, contacts:s.contacts, privacy:s.privacy,
             language:s.language, notif:n,
             appearance: app && {theme:app.theme,density:app.density,msgLayout:app.msgLayout,
                                 sidebarSide:app.sidebarSide,showRoles:app.showRoles,animations:app.animations} };
  });
};
