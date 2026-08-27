export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();
      let j=null;try{j=JSON.parse(t);}catch{}; return j;};
    const norm=x=>Array.isArray(x)?x:((x&&x.roles)||[]);
    const out={killed:[]};
    for (const u of [`/api/v1/companies/${CO}/roles`, `/api/v1/workspaces/${W}/roles`]) {
      for (const r of norm(await g(u))) if (/^D2/.test(r.name)) {
        const d=await fetch(`/api/v1/companies/roles/${r.id}`,{method:'DELETE',credentials:'include'});
        out.killed.push(`${r.name}:${d.status}`);
      }
    }
    out.companyRoles=norm(await g(`/api/v1/companies/${CO}/roles`)).map(r=>r.name);
    out.workspaceRoles=norm(await g(`/api/v1/workspaces/${W}/roles`)).map(r=>r.name);
    const inv=await g(`/api/v1/workspaces/${W}/invites`);
    const arr=(inv&&inv.invites)||[];
    out.invites={total:arr.length, live:arr.filter(i=>i.status!=='revoked').length};
    return out;
  });
};
