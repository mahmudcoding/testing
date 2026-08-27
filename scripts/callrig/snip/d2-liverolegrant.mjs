export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', CAROL='U4QDCAROL000001';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(1800);
  return await page.evaluate(async ([CO,CAROL]) => {
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t)}catch{}; return {s:r.status,j};};
    const c=await call('POST',`/api/v1/companies/${CO}/roles`,{name:'D2 live role',permissions:[`company.${CO}.member.view`]});
    const rid=c.j&&c.j.id;
    const a=rid? await call('POST','/api/v1/companies/roles/assign',{role_id:rid,user_id:CAROL}) : null;
    return { create:c.s, roleId:rid, assign:a&&a.s };
  }, ['O4QDF1XTURESO01','U4QDCAROL000001']);
};
