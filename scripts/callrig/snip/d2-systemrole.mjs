const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=workspace', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    // rows: bind each Edit/Delete pair to the nearest ancestor holding exactly one of each
    const out=[];
    const dels=[...main.querySelectorAll('button')].filter(vis).filter(b=>(b.innerText||'').trim()==='Delete');
    for (const b of dels) {
      let box=b.parentElement, chosen=null;
      for (let i=0;i<6&&box;i++){ const n=[...box.querySelectorAll('button')].filter(x=>(x.innerText||'').trim()==='Delete').length;
        if (n===1) chosen=box; else break; box=box.parentElement; }
      const txt=chosen?(chosen.innerText||'').replace(/\\n/g,' | ').slice(0,80):'(no row)';
      const btns=chosen?[...chosen.querySelectorAll('button')].filter(vis)
        .map(x=>({ t:(x.innerText||'').trim().slice(0,20), dis:x.disabled===true||x.getAttribute('aria-disabled')==='true' })):[];
      out.push({ row: txt, buttons: btns });
    }
    const allRows=(main.innerText||'').split('\\n').filter(t=>/workspace_owner|Member/.test(t)).slice(0,6);
    return { rowsWithDelete: out, roleLinesOnPage: allRows }; })()`);
};
