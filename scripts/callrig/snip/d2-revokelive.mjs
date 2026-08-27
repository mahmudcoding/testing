export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  return await page.evaluate(async (WS) => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'}); try{return await r.json();}catch{return null;}};
    const links=await g(`/api/v1/workspaces/${WS}/invites`);
    const live=(links?.invites||[]).filter(i=>i.status!=='revoked');
    const out=[];
    for (const i of live) {
      const r=await fetch(`/api/v1/workspaces/invites/${i.id}/revoke`,{method:'POST',credentials:'include'});
      out.push({id:i.id, revoke:r.status});
    }
    const after=await g(`/api/v1/workspaces/${WS}/invites`);
    return { revoked:out, liveNow:(after?.invites||[]).filter(i=>i.status!=='revoked').length };
  }, WS);
};
