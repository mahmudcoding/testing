// Generate audit entries by assigning/revoking a probe role in-page (fast: all
// fetches inside one browser call). QA_N = number of assign/revoke pairs.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=workspace`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(async ({WS,N})=>{
    const post=async(u,b)=>{const r=await fetch(u,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}); return {s:r.status, t:(await r.text()).slice(0,120)};};
    const count=async()=>{const r=await fetch(`/api/v1/workspaces/${WS}/admin/audit-log?limit=100`,{credentials:'include'});
      const j=await r.json(); return (Array.isArray(j)?j:(j.entries||[])).length;};
    const before=await count();
    // one throwaway role
    const mk=await post(`/api/v1/workspaces/${WS}/roles`,{name:'QA D2 volume probe',description:'audit volume probe',
      permissions:[`workspace.${WS}.channels.view`]});
    const roleId=(mk.t.match(/"id":"([^"]+)"/)||[])[1];
    if(!roleId) return {err:'no role', mk};
    const uid='U4QDCAROL000001';
    let ok=0, fail=0;
    for(let i=0;i<N;i++){
      const a=await post(`/api/v1/workspaces/${WS}/roles/assign`,{role_id:roleId,user_id:uid});
      const b=await post(`/api/v1/workspaces/${WS}/roles/revoke`,{role_id:roleId,user_id:uid});
      if(a.s===200&&b.s===200) ok++; else { fail++; if(fail<3) var sample={a,b}; }
    }
    const del=await fetch(`/api/v1/companies/roles/${roleId}`,{method:'DELETE',credentials:'include'});
    const after=await count();
    return {before, after, pairsOk:ok, pairsFailed:fail, sample:typeof sample!=='undefined'?sample:null, roleDeleted:del.status};
  }, {WS, N: Number(process.env.QA_N||40)});
};
