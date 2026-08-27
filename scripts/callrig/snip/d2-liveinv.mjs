export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  return await page.evaluate(async (WS) => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'}); try{return await r.json();}catch{return null;}};
    const links=await g(`/api/v1/workspaces/${WS}/invites`);
    const direct=await g(`/api/v1/workspaces/${WS}/invites/direct`);
    return { liveLinks:(links?.invites||[]).filter(i=>i.status!=='revoked')
               .map(i=>({id:i.id,status:i.status,created:i.created_at,uses:i.used_count+'/'+i.max_uses})),
             liveDirect:(direct?.invites||[]).filter(i=>i.status!=='revoked')
               .map(i=>({id:i.id,status:i.status,created:i.created_at,to:i.recipient_user_id})) };
  }, WS);
};
