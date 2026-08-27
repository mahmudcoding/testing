export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const get=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();
      let j=null;try{j=JSON.parse(t)}catch{};return{s:r.status,j,raw:t.slice(0,160)};};
    const out={};
    for (const [k,u] of [['companyRoles',`/api/v1/companies/${CO}/roles`],
                         ['workspaceRoles',`/api/v1/workspaces/${W}/roles`]]) {
      const r=await get(u);
      const arr=Array.isArray(r.j)?r.j:((r.j&&(r.j.roles||r.j.items))||[]);
      out[k]={ status:r.s, roles: arr.map(x=>({ name:x.name, id:(x.id||'').slice(0,8),
        perms:(x.permissions||[]).map(p=>p.replace(CO,'<CO>').replace(W,'<WS>')) })) };
    }
    return out;
  });
};
