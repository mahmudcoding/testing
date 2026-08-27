const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const ROUTES=['settings/account','settings/profile','settings/privacy','settings/notifications',
  'settings/appearance','settings/sessions','settings/security','settings/company','settings/workspace',
  'settings/roles?scope=company','settings/admin/company','settings/admin/members',
  'settings/admin/invites','settings/admin/workspaces','settings/admin/audit-log','settings/about','settings/calls'];
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={}; let dupTotal=0, namelessTotal=0, imgTotal=0;
  for (const route of ROUTES) {
    await page.goto(`https://airion-cargo.store/w/${W}/${route}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2200);
    const r = await page.evaluate(`(() => { const vis=(${VIS});
      // duplicate ids anywhere in the document
      const ids={}; [...document.querySelectorAll('[id]')].forEach(e=>{ ids[e.id]=(ids[e.id]||0)+1; });
      const dups=Object.entries(ids).filter(([k,v])=>v>1).map(([k,v])=>k+' x'+v);
      // visible form controls with no accessible name
      const nameless=[...document.querySelectorAll('input,select,textarea')].filter(vis)
        .filter(e=>e.type!=='hidden')
        .filter(e=>{
          const al=e.getAttribute('aria-label'); if(al&&al.trim()) return false;
          const lb=e.getAttribute('aria-labelledby'); if(lb&&document.getElementById(lb.split(' ')[0])) return false;
          if(e.id && document.querySelector('label[for="'+CSS.escape(e.id)+'"]')) return false;
          if(e.closest('label')) return false;
          if(e.getAttribute('placeholder')) return false;
          return true; })
        .map(e=>e.tagName.toLowerCase()+'['+(e.type||'')+']');
      // images without alt
      const imgs=[...document.querySelectorAll('img')].filter(vis)
        .filter(e=>e.getAttribute('alt')===null).length;
      return { dups, nameless, imgsNoAlt: imgs }; })()`);
    dupTotal+=r.dups.length; namelessTotal+=r.nameless.length; imgTotal+=r.imgsNoAlt;
    if (r.dups.length || r.nameless.length || r.imgsNoAlt) out[route]=r;
  }
  return { routes:ROUTES.length, duplicateIdRoutes:Object.keys(out).length,
           totals:{ duplicateIds:dupTotal, namelessControls:namelessTotal, imagesWithoutAlt:imgTotal },
           detail: out };
};
