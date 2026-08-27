export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
  return await page.evaluate(async ({CO,ALICE}) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,120)};};
    const all=await (await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'})).json();
    const probes=(all.roles||[]).filter(r=>/QA D CoProbe/.test(r.name));
    const out=[];
    for (const p of probes) {
      const rev=await j('/api/v1/companies/roles/revoke','POST',{role_id:p.id,user_id:ALICE});
      const del=await j(`/api/v1/companies/roles/${p.id}`,'DELETE');
      out.push({name:p.name, revoke:rev.s, del:del.s});
    }
    const after=await (await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'})).json();
    return { cleaned:out, rolesNow:(after.roles||[]).map(r=>r.name) };
  }, {CO,ALICE});
};
