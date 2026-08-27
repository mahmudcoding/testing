const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const ROUTES=['settings/account','settings/profile','settings/privacy','settings/notifications',
  'settings/appearance','settings/sessions','settings/security','settings/company','settings/workspace',
  'settings/roles?scope=company','settings/admin/company','settings/admin/members',
  'settings/admin/invites','settings/admin/workspaces','settings/about','settings/calls'];
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const r of ROUTES) {
    await page.goto(`https://airion-cargo.store/w/${W}/${r}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2200);
    // popup triggers in the content area, excluding anything destructive
    const trigs = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      return [...main.querySelectorAll('button,[role=button]')].filter(vis)
        .filter(b=>b.getAttribute('aria-haspopup'))
        .filter(b=>b.getBoundingClientRect().left>300)
        .filter(b=>!/remove|delete|revoke|leave|deactivate/i.test((b.innerText||'')+(b.getAttribute('aria-label')||'')))
        .map(b=>((b.innerText||'').replace(/\\s+/g,' ').trim()||b.getAttribute('aria-label')||'?').slice(0,26)); })()`);
    const found=[];
    for (const t of trigs) {
      const TL = JSON.stringify(t);
      const clicked = await page.evaluate(`(() => { const vis=(${VIS});
        const main=document.querySelector('main')||document.body;
        const b=[...main.querySelectorAll('button,[role=button]')].filter(vis)
          .filter(x=>x.getAttribute('aria-haspopup'))
          .filter(x=>(((x.innerText||'').replace(/\\s+/g,' ').trim()||x.getAttribute('aria-label')||'')).slice(0,26)===${TL})[0];
        if(!b) return 'no match'; b.click(); return 'clicked'; })()`).catch(e=>'err');
      await page.waitForTimeout(1400);
      const dlg = await page.evaluate(`(() => { const vis=(${VIS});
        const d=[...document.querySelectorAll('[role=dialog],[role=menu]')].filter(vis)[0];
        return d? (d.innerText||'').replace(/\\s+/g,' ').slice(0,110) : null; })()`);
      found.push({ trigger:t, click:clicked, opened: dlg });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    if (trigs.length) out[r]=found;
  }
  return out;
};
