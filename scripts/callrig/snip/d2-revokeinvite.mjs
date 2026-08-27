export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  return await page.evaluate(async (WS) => {
    const j=async(u,m)=>{const r=await fetch(u,{method:m||'GET',credentials:'include'});return {s:r.status,t:(await r.text()).slice(0,200)};};
    const rev=await j('/api/v1/workspaces/invites/I4OXIF7Q4R71R3W/revoke','POST');
    const list=await j(`/api/v1/workspaces/${WS}/invites`);
    let live=null; try{ const p=JSON.parse(list.t.length<200?list.t:'{}'); }catch{}
    const full=await (await fetch(`/api/v1/workspaces/${WS}/invites`,{credentials:'include'})).json();
    return { revoke:rev, remaining:(full.invites||[]).map(i=>({id:i.id,status:i.status})) };
  }, WS);
};
