export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text();let j=null;try{j=JSON.parse(t);}catch{};return{s:r.status,j};};
    const out={};
    const rows = j => Array.isArray(j) ? j : ((j && j.entries) || []);
    const before = await call('GET', `/api/v1/companies/${CO}/admin/audit-log?limit=3`);
    out.newestBefore = rows(before.j).slice(0,1).map(e=>({action:e.action, at:e.created_at}));
    // three distinct, identifiable actions
    const NAME='D2 audit accuracy probe';
    const c = await call('POST', `/api/v1/companies/${CO}/roles`, { name:NAME, permissions:[`company.${CO}.member.view`] });
    out.create = c.s; const rid = c.j && c.j.id;
    const a = rid ? await call('POST','/api/v1/companies/roles/assign',{role_id:rid,user_id:ALICE}) : null;
    out.assign = a && a.s;
    const rv = rid ? await call('POST','/api/v1/companies/roles/revoke',{role_id:rid,user_id:ALICE}) : null;
    out.revoke = rv && rv.s;
    const d = rid ? await call('DELETE', `/api/v1/companies/roles/${rid}`) : null;
    out.delete = d && d.s;
    await new Promise(r=>setTimeout(r,2500));
    const after = await call('GET', `/api/v1/companies/${CO}/admin/audit-log?limit=12`);
    const ent = rows(after.j).map(e=>({ action:e.action, actor:(e.actor_name||e.actor_id||'').slice(-10),
      target:(e.target_name||e.target_id||'').slice(-24), at:e.created_at,
      meta: JSON.stringify(e.metadata||e.details||{}).slice(0,90) }));
    out.newestAfter = ent.slice(0,8);
    out.mentionsProbe = ent.filter(e=>/audit accuracy probe/i.test(JSON.stringify(e))).length;
    return out;
  });
};
