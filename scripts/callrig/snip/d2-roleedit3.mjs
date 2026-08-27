const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const SCOPE = process.env.D2_SCOPE || 'workspace';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=${SCOPE}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const all=[...main.querySelectorAll('button,a[href],input,select,textarea,[role=switch],[role=combobox],[role=button],[onclick]')];
    const desc=e=>{const r=e.getBoundingClientRect();return{
      tag:e.tagName.toLowerCase(), x:Math.round(r.x), y:Math.round(r.y),
      t:(e.innerText||'').trim().slice(0,45), al:(e.getAttribute('aria-label')||'').slice(0,55),
      tid:e.getAttribute('data-testid')||'', vis:vis(e), type:e.getAttribute('type')||''};};
    const list=all.map(desc);
    return { total:list.length,
      xs:[...new Set(list.map(o=>o.x))].sort((a,b)=>a-b).slice(0,12),
      editish:list.filter(o=>/edit|pencil|manage|modif|change/i.test(o.t+' '+o.al+' '+o.tid)),
      nonNav:list.filter(o=>o.x>300),
      invisible:list.filter(o=>!o.vis).slice(0,15) }; })()`);
};
