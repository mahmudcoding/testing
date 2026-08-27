const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page, browser }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  const go=async p=>{ await page.goto(`https://airion-cargo.store/w/${W}/${p}`,{waitUntil:'networkidle'});
                      await page.waitForTimeout(2600); };

  // ALK-3537 — Workspace identity subtitle promises URL + default channel
  await go('settings/workspace');
  out.ALK_3537 = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { promisesUrlAndChannel:/Name, URL, and default channel/i.test(t),
             editableFields:[...main.querySelectorAll('input,textarea,select')].filter(vis)
               .filter(e=>e.type!=='search').length }; })()`);

  // ALK-3005 — sessions named "Unknown device" while the UA is present
  await go('settings/sessions');
  out.ALK_3005 = await page.evaluate(`(async () => { const vis=(${VIS});
    const t=(document.querySelector('main')||document.body).innerText.replace(/\\s+/g,' ');
    const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const a=Array.isArray(j)?j:((j&&(j.sessions||j.items))||[]);
    return { screenSaysUnknown:/Unknown device/i.test(t),
             apiDeviceName:(a[0]||{}).device_name??null,
             apiHasUserAgent: !!((a[0]||{}).user_agent) }; })()`);

  // ALK-3535 — company-level events never reach the screen
  await go('settings/admin/audit-log');
  out.ALK_3535 = await page.evaluate(`(async()=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const j=await r.json().catch(()=>null);
      return Array.isArray(j)?j:((j&&j.entries)||[]);};
    const co=await g('/api/v1/companies/O4QDF1XTURESO01/admin/audit-log?limit=100');
    const ws=await g('/api/v1/workspaces/W4QDF1XTURESO01/admin/audit-log?limit=100');
    const coOnly=[...new Set(co.map(e=>e.action))].filter(a=>a.startsWith('company.'));
    const wsActions=[...new Set(ws.map(e=>e.action))];
    const onScreen=(document.querySelector('main')||document.body).innerText;
    return { companyScopedActions:coOnly, presentInWorkspaceLog:coOnly.filter(a=>wsActions.includes(a)),
             anyOnScreen:coOnly.filter(a=>onScreen.includes(a)) };})()`);

  // ALK-3025 — invalid reset link shows the form, offers no new link
  const ctx=await browser.newContext(); const p2=await ctx.newPage();
  try {
    await p2.goto('https://airion-cargo.store/reset-password?token=bad-token-000',{waitUntil:'networkidle'});
    await p2.waitForTimeout(2400);
    out.ALK_3025 = await p2.evaluate(`(() => { const vis=(${VIS});
      const b=document.body; const t=(b.innerText||'').replace(/\\s+/g,' ');
      const ctl=[...b.querySelectorAll('button,a[href],input')].filter(vis)
        .map(e=>(e.innerText||'').trim()||e.type).filter(Boolean);
      return { showsPasswordForm:/Set a new password/i.test(t),
               saysLinkInvalid:/invalid|expired/i.test(t),
               offersNewLink:/request a new|forgot/i.test(t), controls:ctl }; })()`);
  } finally { await ctx.close(); }
  return out;
};
