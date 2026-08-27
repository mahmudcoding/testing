const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const NAMES = `() => { const vis=(${VIS});
  const main=document.querySelector('main')||document.body;
  const ctrls=[...main.querySelectorAll('input,select,textarea,button,[role=switch],[role=combobox],[role=radio]')].filter(vis);
  const accName = e => {
    const al=e.getAttribute('aria-label'); if (al && al.trim()) return {name:al.trim(), via:'aria-label'};
    const lb=e.getAttribute('aria-labelledby');
    if (lb) { const t=lb.split(/\\s+/).map(id=>{const x=document.getElementById(id); return x?(x.innerText||'').trim():'';}).join(' ').trim();
      if (t) return {name:t, via:'aria-labelledby'}; }
    if (e.id) { const l=document.querySelector('label[for="'+CSS.escape(e.id)+'"]');
      if (l && (l.innerText||'').trim()) return {name:(l.innerText||'').trim(), via:'label[for]'}; }
    const wrap=e.closest('label'); if (wrap && (wrap.innerText||'').trim()) return {name:(wrap.innerText||'').trim(), via:'wrapping label'};
    const ti=e.getAttribute('title'); if (ti && ti.trim()) return {name:ti.trim(), via:'title'};
    const txt=(e.innerText||'').trim(); if (txt) return {name:txt, via:'text content'};
    const ph=e.getAttribute('placeholder'); if (ph && ph.trim()) return {name:ph.trim(), via:'PLACEHOLDER ONLY'};
    return {name:'', via:'NONE'};
  };
  return ctrls.map(e=>{ const a=accName(e);
    return { tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'', type:e.getAttribute('type')||'',
             name:a.name.slice(0,38), via:a.via }; }); }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const routes=['account','profile','notifications','appearance','calls','privacy','security',
                'company','workspace','roles?scope=company','admin/members','admin/invites'];
  const out=[];
  for (const r of routes) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${r}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(1700);
    const all = await page.evaluate(`(${NAMES})()`);
    const bad = all.filter(x=>x.via==='NONE' || x.via==='PLACEHOLDER ONLY');
    out.push({ route:r, total:all.length, unnamed:bad });
  }
  return out;
};
