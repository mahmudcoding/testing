export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', CAROL='U4QDCAROL000001';
  return await page.evaluate(async ({CO,CAROL}) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,160)};};
    const made=await j(`/api/v1/companies/${CO}/roles`,'POST',
      {name:'QA D LiveProbe', permissions:[`company.${CO}.member.view`]});
    let id=null; try{id=JSON.parse(made.t)?.id;}catch{}
    const asg = id? await j('/api/v1/companies/roles/assign','POST',{role_id:id,user_id:CAROL}) : null;
    return { create:made.s, roleId:id, assign:asg&&asg.s };
  }, {CO,CAROL});
};
