export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', CAROL='U4QDCAROL000001';
  return await page.evaluate(async ({CO,CAROL}) => {
    const all=await (await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'})).json();
    const t=(all.roles||[]).find(r=>r.name==='QA D LiveProbe');
    if(!t) return {err:'not found', names:(all.roles||[]).map(r=>r.name)};
    const r=await fetch('/api/v1/companies/roles/assign',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({role_id:t.id,user_id:CAROL})});
    return { role:t.name, id:t.id, assign:r.status, body:(await r.text()).slice(0,60) };
  }, {CO,CAROL});
};
