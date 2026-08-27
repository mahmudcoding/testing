const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LBL = `(e) => { let l=e.getAttribute('aria-label')||'';
  if(!l){ let p=e.parentElement; for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<90){ l=t.split('\\n')[0]; break; } } p=p.parentElement; } } return l.slice(0,56); }`;
export default async ({ page }) => {
  const out={};
  for (const scope of ['company','workspace','channel']) {
    await page.goto(`https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=${scope}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(3000);
    out[scope] = await page.evaluate(`(() => { const vis=(${VIS}); const lbl=(${LBL});
      const main=document.querySelector('main')||document.body;
      const tabs=[...main.querySelectorAll('button,[role=tab],a')].filter(vis)
        .map(e=>(e.innerText||'').trim()).filter(t=>/roles$/i.test(t)).slice(0,5);
      const boxes=[...main.querySelectorAll('input')].filter(vis).filter(e=>e.type==='checkbox'||String(e.value)==='on')
        .map(e=>lbl(e));
      const t=(main.innerText||''); const i=t.lastIndexOf('\\u203a');
      return { tabs, permissionCheckboxes: boxes, count: boxes.length,
               content:(i>=0?t.slice(i+1):t).replace(/\\s+/g,' ').trim().slice(0,150) }; })()`);
  }
  return out;
};
