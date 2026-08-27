export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();
      let j=null;try{j=JSON.parse(t);}catch{}; return {s:r.status,j};};
    const out={killed:[]};
    for (const [scope,u] of [['co',`/api/v1/companies/${CO}/roles`],['ws',`/api/v1/workspaces/${W}/roles`]]) {
      const l=await g(u); const arr=Array.isArray(l.j)?l.j:((l.j&&l.j.roles)||[]);
      for(const r of arr) if(/^D2 /.test(r.name)){
        const d=await fetch(`/api/v1/companies/roles/${r.id}`,{method:'DELETE',credentials:'include'});
        out.killed.push(`${scope}:${r.name}:${d.status}`);
      }
    }
    const after=await g(`/api/v1/companies/${CO}/roles`);
    const arr=Array.isArray(after.j)?after.j:((after.j&&after.j.roles)||[]);
    out.remaining = arr.map(r=>r.name);
    const aw=await g(`/api/v1/workspaces/${W}/roles`);
    const arrw=Array.isArray(aw.j)?aw.j:((aw.j&&aw.j.roles)||[]);
    out.remainingWs = arrw.map(r=>r.name);
    return out;
  });
};
