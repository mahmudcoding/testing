// Re-verify the morning sector-D pass's four findings on the current build.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const out={};
  // --- their BUG-1 / ALK-3535: company-scope events never shown on the audit page
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.auditLog = await page.evaluate(async ({WS,CO})=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'}); const j=await r.json(); return Array.isArray(j)?j:(j.entries||[]);};
    const co=await g(`/api/v1/companies/${CO}/admin/audit-log?limit=100`);
    const ws=await g(`/api/v1/workspaces/${WS}/admin/audit-log?limit=100`);
    const onScreen=[...document.querySelectorAll('tbody tr')].map(tr=>(tr.querySelector('td')||{}).innerText||'').map(s=>s.trim());
    const companyScope=co.filter(e=>e.scope_type==='company');
    return {companyLog:co.length, workspaceLog:ws.length, rowsOnScreen:onScreen.length,
      companyScopeEvents: companyScope.length,
      companyScopeActions:[...new Set(companyScope.map(e=>e.action))],
      anyCompanyScopeOnScreen: companyScope.some(e=>onScreen.includes(e.action)),
      screenActionsSample:[...new Set(onScreen)].slice(0,8)};
  }, {WS,CO});
  // --- their BUG-3 / ALK-3536: raw audit.view key in the permission list
  for (const scope of ['company','workspace']) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=${scope}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5000);
    out['perms_'+scope] = await page.evaluate(()=>{
      const lab=b=>{ if(b.id){const l=document.querySelector(`label[for="${CSS.escape(b.id)}"]`); if(l)return l.innerText.trim();}
        const l=b.closest('label'); if(l)return l.innerText.trim();
        let p=b.parentElement; for(let k=0;k<4&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<120)return t;} return ''; };
      const labels=[...document.querySelectorAll('input[type=checkbox]')].map(lab);
      return {count:labels.length, rawKeys:labels.filter(l=>/^[a-z]+(\.[a-z]+)+$/.test(l)), auditLabel:labels.find(l=>/audit/i.test(l))||null};
    });
  }
  // --- their BUG-2 / owner cannot leave, and BUG-4 / Workspace identity subtitle
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.workspacePage = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Workspace identity'), d=t.indexOf('Danger zone');
    return {identitySubtitle:t.slice(i,i+90), dangerZone:t.slice(d,d+150),
      textInputs:[...m.querySelectorAll('input[type=text]')].filter(vis).length,
      leaveBtn:(()=>{const b=[...m.querySelectorAll('button')].find(x=>/^Leave workspace$/.test(x.innerText.trim())); return b?(b.disabled?'disabled':'enabled'):'absent';})(),
      transferControl:[...m.querySelectorAll('button,a')].filter(vis).map(b=>b.innerText.trim()).filter(x=>/transfer|ownership/i.test(x))};
  });
  return out;
};
