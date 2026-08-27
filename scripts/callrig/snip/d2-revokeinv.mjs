export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();
      let j=null;try{j=JSON.parse(t);}catch{}; return {s:r.status,j,t:t.slice(0,200)};};
    const list=await g(`/api/v1/workspaces/${W}/invites`);
    const arr=(list.j&&(list.j.invites||list.j.items))||(Array.isArray(list.j)?list.j:[]);
    const killed=[];
    for(const inv of arr){
      const r=await fetch(`/api/v1/workspaces/invites/${inv.id}/revoke`,{method:'POST',credentials:'include'});
      killed.push(`${inv.id} max_uses=${inv.max_uses} roles=${(inv.role_ids||[]).length} -> ${r.status}`);
    }
    const after=await g(`/api/v1/workspaces/${W}/invites`);
    const arr2=(after.j&&(after.j.invites||after.j.items))||(Array.isArray(after.j)?after.j:[]);
    return { before:arr.length, killed, after:arr2.length, rawAfter:after.t.slice(0,140) };
  });
};
