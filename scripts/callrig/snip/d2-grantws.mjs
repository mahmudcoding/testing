export default async ({ page }) => {
  const ACTION = process.env.D2_ACTION;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=workspace', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1200);
  return await page.evaluate(async (action) => {
    const W='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text();let j=null;try{j=JSON.parse(t);}catch{};return{s:r.status,j,raw:t.slice(0,120)};};
    const list=await call('GET',`/api/v1/workspaces/${W}/roles`);
    const arr=Array.isArray(list.j)?list.j:(list.j.roles||[]);
    for (const r of arr) if (/^D2 wssweep/.test(r.name)) {
      await call('POST',`/api/v1/workspaces/${W}/roles/revoke`,{role_id:r.id,user_id:ALICE});
      await call('DELETE',`/api/v1/companies/roles/${r.id}`);
    }
    if (action==='CLEANUP') return { cleaned:true };
    const c=await call('POST',`/api/v1/workspaces/${W}/roles`,
      { name:'D2 wssweep', permissions:[`workspace.${W}.${action}`] });
    const rid=c.j&&c.j.id;
    const a=rid?await call('POST',`/api/v1/workspaces/${W}/roles/assign`,{role_id:rid,user_id:ALICE}):null;
    return { action, created:c.s, createBody:c.raw, assigned:a&&a.s };
  }, ACTION);
};
