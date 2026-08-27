const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const out={};
  const go=async p=>{ await page.goto(`https://airion-cargo.store/w/${W}/${p}`,{waitUntil:'networkidle'});
                      await page.waitForTimeout(2600); };

  // ALK-3536 + ALK-1954 — raw permission keys in the role catalogue
  await go('settings/roles?scope=company');
  out.ALK_3536_1954 = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const labels=[...main.querySelectorAll('input[type=checkbox]')].filter(vis)
      .map(cb=>{const l=cb.closest('label')||cb.parentElement; return ((l&&l.innerText)||'').replace(/\\s+/g,' ').trim();}).filter(Boolean);
    const raw=labels.filter(l=>/^[a-z]+(\\.[a-z_]+)+$/.test(l.split(' ')[0]));
    return { labels:labels.length, rawKeyLabels:raw.length,
             auditLabel: labels.find(l=>/audit/i.test(l))||null,
             roleManageLabel: labels.find(l=>/assign or revoke/i.test(l))||null }; })()`);

  // ALK-2241 — Danger zone
  await go('settings/account');
  out.ALK_2241 = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button')].filter(vis)
      .filter(b=>/Deactivate|Delete/i.test(b.innerText||''))
      .map(b=>({t:(b.innerText||'').trim().slice(0,14), disabled:b.disabled===true})); })()`);

  // ALK-2654 — workspace storage endpoint and values
  await go('settings/admin/workspaces');
  out.ALK_2654 = await page.evaluate(`(async () => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/Show storage/i.test(x.innerText||''))[0];
    if(b) b.click();
    await new Promise(r=>setTimeout(r,1600));
    const t=(document.querySelector('main')||document.body).innerText.replace(/\\s+/g,' ');
    const s=await fetch('/api/v1/workspaces/W4QDF1XTURESO01/storage',{credentials:'include'});
    return { endpointStatus:s.status, showsBytes:/\\d+(\\.\\d+)?\\s?(B|KB|MB|GB)\\b/.test(t),
             unavailable:/unavailable/i.test(t) }; })()`);

  // ALK-2242 — company kick writes a workspace audit entry
  out.ALK_2242 = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/companies/O4QDF1XTURESO01/admin/audit-log?limit=100',{credentials:'include'});
    const j=await r.json().catch(()=>null); const rows=Array.isArray(j)?j:((j&&j.entries)||[]);
    const co=rows.filter(e=>e.action==='company.member_removed');
    const pairs=co.filter(c=>rows.some(w=>w.action==='workspace.member_removed'&&w.created_at===c.created_at));
    return { companyRemovals:co.length, thoseWithMatchingWorkspaceEntry:pairs.length };})()`);
  return out;
};
