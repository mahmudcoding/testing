export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/workspaces`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  return await page.evaluate(`(async()=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'});
      const j=await r.json().catch(()=>null); return {s:r.status,j};};
    const w=await g('/api/v1/companies/O4QDF1XTURESO01/workspaces');
    const a=Array.isArray(w.j)?w.j:((w.j&&(w.j.workspaces||w.j.items))||[]);
    const mine=await g('/api/v1/users/me/workspaces');
    const m=Array.isArray(mine.j)?mine.j:((mine.j&&(mine.j.workspaces||mine.j.items))||[]);
    return { companyWorkspaces:{status:w.s, count:a.length, names:a.map(x=>x.name)},
             myWorkspaces:{count:m.length, names:m.map(x=>x.name)} };})()`);
};
