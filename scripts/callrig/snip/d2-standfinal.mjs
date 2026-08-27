export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', WS='W4QDF1XTURESO01';
  return await page.evaluate(async ({CO,WS}) => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'}); try{return await r.json();}catch{return null;}};
    const me=await g('/api/v1/auth/me');
    const co=await g(`/api/v1/companies/${CO}/roles`);
    const ws=await g(`/api/v1/workspaces/${WS}/roles`);
    const inv=await g(`/api/v1/workspaces/${WS}/invites`);
    const blocked=await g('/api/v1/messaging/users/blocked');
    const notif=await g('/api/v1/notifications/settings');
    let app={}; try{app=JSON.parse(localStorage.getItem('aloqa.appearance')||'{}');}catch{}
    return { who:me.email,
      profile: me.settings?.profile, online_visibility: me.settings?.online_visibility,
      companyRoles:(co?.roles||[]).map(r=>r.name), workspaceRoles:(ws?.roles||[]).map(r=>r.name),
      liveInvites:(inv?.invites||[]).filter(i=>i.status!=='revoked').length,
      blocked:(blocked?.users||blocked?.blocked||[]).length,
      notifications: notif, appearanceKeys:Object.keys(app).length };
  }, {CO,WS});
};
