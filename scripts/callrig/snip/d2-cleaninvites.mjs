export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1500);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch(`/api/v1/workspaces/${W}/invites`,{credentials:'include'});
    if(r.status!==200) return {list:r.status};
    const j=await r.json(); const arr=j.invites||j.items||(Array.isArray(j)?j:[]);
    const killed=[];
    for(const inv of arr){ if(inv.max_uses===1 && (!inv.role_ids||!inv.role_ids.length)){
      const d=await fetch(`/api/v1/workspaces/invites/${inv.id}`,{method:'DELETE',credentials:'include'});
      killed.push(inv.id+':'+d.status); } }
    return { total:arr.length, killed };
  });
};
