export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const post=async(u,b)=>{const r=await fetch(u,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      const t=await r.text();let j=null;try{j=JSON.parse(t)}catch{};return{s:r.status,j,t:t.slice(0,140)};};
    const out={};
    out.create=await post(`/api/v1/companies/${CO}/roles`,
      { name:'D2 kick only', permissions:[`company.${CO}.member.kick`] });
    const rid=out.create.j&&(out.create.j.id||(out.create.j.role||{}).id);
    out.roleId=rid;
    if(rid) out.assign=await post('/api/v1/companies/roles/assign',{role_id:rid,user_id:ALICE});
    // confirm the custom role really carries exactly one permission
    const rr=await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'});
    const rj=await rr.json().catch(()=>null);
    const rl=Array.isArray(rj)?rj:((rj&&(rj.roles||rj.items))||[]);
    const mine=rl.find(x=>x.id===rid);
    out.rolePerms = mine? (mine.permissions||[]).map(p=>p.replace(CO,'<CO>')) : null;
    return out;
  });
};
