export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1500);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text();let j=null;try{j=JSON.parse(t);}catch{};return{s:r.status,j};};
    // clean any leftovers
    const list=await call('GET',`/api/v1/companies/${CO}/roles`);
    const arr=Array.isArray(list.j)?list.j:(list.j.roles||[]);
    for (const r of arr) if (/^D2 /.test(r.name)) {
      await call('POST','/api/v1/companies/roles/revoke',{role_id:r.id,user_id:ALICE});
      await call('DELETE',`/api/v1/companies/roles/${r.id}`); }
    const out={};
    const a=await call('POST',`/api/v1/companies/${CO}/roles`,{name:'D2 reader',permissions:[`company.${CO}.role.get`]});
    const b=await call('POST',`/api/v1/companies/${CO}/roles`,{name:'D2 writer',permissions:[`company.${CO}.role.manage`]});
    out.created=[a.s,b.s];
    out.assigned=[(await call('POST','/api/v1/companies/roles/assign',{role_id:a.j.id,user_id:ALICE})).s,
                  (await call('POST','/api/v1/companies/roles/assign',{role_id:b.j.id,user_id:ALICE})).s];
    return out;
  });
};
