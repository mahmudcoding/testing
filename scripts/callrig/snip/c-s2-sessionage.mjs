// read-only + authenticated GETs; no navigation, safe for the parked tab
export default async ({page}) => page.evaluate(async ()=>{
  const t=async(u)=>{const r=await fetch(u,{credentials:'include'});
    return {u:u.replace(/^\/api\/v1/,''), status:r.status};};
  const me=await fetch('/api/v1/auth/me',{credentials:'include'});
  const mj=await me.json().catch(()=>({}));
  return {
    openMinutes:+(performance.now()/60000).toFixed(1),
    authMe:{status:me.status, who:mj.email||(mj.user&&mj.user.email)||null},
    calls:[await t('/api/v1/workspaces/W4QCF1XTURESO01/unread'),
           await t('/api/v1/messaging/channels/C4QCGENERAL0001/messages?limit=1'),
           await t('/api/v1/notifications?limit=1'),
           await t('/api/v1/users/me/workspaces')],
    cookiePresent: document.cookie.length>0,
    visibility: document.visibilityState};
});
