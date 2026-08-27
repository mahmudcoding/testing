export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t)}catch{}; return {s:r.status,j,t:t.slice(0,120)};};
    const avail=await call('GET',`/api/v1/companies/${CO}/permissions/available`);
    const list=Array.isArray(avail.j)?avail.j:((avail.j&&(avail.j.permissions||avail.j.items))||[]);
    const perms=list.map(p=>typeof p==='string'?p:(p.value||p.key||p.permission||p.action))
                    .filter(Boolean).filter(p=>!/\*$/.test(p));
    const c=await call('POST',`/api/v1/companies/${CO}/roles`,{name:'D2 allperms', permissions:perms});
    const rid=c.j&&c.j.id;
    const a=rid? await call('POST','/api/v1/companies/roles/assign',{role_id:rid,user_id:ALICE}):null;
    return { availableStatus:avail.s, permissionCount:perms.length,
             permissions:perms.map(p=>p.replace(CO,'<CO>')), create:c.s, roleId:rid,
             assign:a&&a.s, createBody:c.t };
  });
};
