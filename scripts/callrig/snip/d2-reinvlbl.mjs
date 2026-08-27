const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const setup = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call = async (m,u,b) => { const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,j}; };
    const out={};
    // restore alice: revoke the kick probe role
    const cr = await call('GET', `/api/v1/companies/${CO}/roles`);
    const arr = Array.isArray(cr.j)?cr.j:(cr.j.roles||[]);
    const kick = arr.find(r=>r.name==='D2 reverify kick');
    if (kick) out.revokeKick = (await call('POST','/api/v1/companies/roles/revoke',{ role_id:kick.id, user_id:ALICE })).s;
    // two invites: one WITH a role, one WITHOUT
    const wr = await call('GET', `/api/v1/workspaces/${W}/roles`);
    const warr = Array.isArray(wr.j)?wr.j:(wr.j.roles||[]);
    const member = warr.find(r=>r.name==='Member');
    out.withRole = (await call('POST','/api/v1/workspaces/invites',{ workspace_id:W, role_ids:[member.id], max_uses:1, expires_in_days:1 })).j;
    out.withoutRole = (await call('POST','/api/v1/workspaces/invites',{ workspace_id:W, role_ids:[], max_uses:1, expires_in_days:1 })).j;
    return { revokeKick: out.revokeKick, withRoleId: out.withRole && out.withRole.id, withoutRoleId: out.withoutRole && out.withoutRole.id };
  });
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(3500);
  const list = await page.evaluate(`(() => { const vis = ${VIS};
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||''); const i=t.indexOf('Shareable');
    return (i>=0?t.slice(i):t).replace(/\\n+/g,' | ').slice(0,700); })()`);
  // clean up both invites
  const cleanup = await page.evaluate(async ([a,b]) => {
    const r=[]; for (const id of [a,b]) { if(!id) continue;
      const x = await fetch(`/api/v1/workspaces/invites/${id}/revoke`,{method:'POST',credentials:'include'}); r.push(x.status); }
    return r; }, [setup.withRoleId, setup.withoutRoleId]);
  return { setup, invitesListText: list, cleanupStatuses: cleanup };
};
