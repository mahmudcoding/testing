const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const groups = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const rs=[...main.querySelectorAll('[role=radio]')].filter(vis);
    const map=new Map();
    for(const r of rs){ let n=r.parentElement, key=null;
      for(let i=0;i<4&&n;i++){ if([...n.querySelectorAll('[role=radio]')].filter(vis).length>=2){ key=n; break; } n=n.parentElement; }
      if(!key) continue; if(!map.has(key)) map.set(key,[]); map.get(key).push(r); }
    return [...map.values()].map(kids=>kids.map(k=>((k.innerText||'').trim()||k.getAttribute('aria-label')||'?').slice(0,14)+'='+k.getAttribute('aria-checked'))); })()`);
  // focus the density group (Compact/Cozy/Comfortable) and arrow through it
  const focused = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const rs=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(e=>['Compact','Cozy','Comfortable'].includes((e.innerText||'').trim()));
    const on=rs.filter(e=>e.getAttribute('aria-checked')==='true')[0] || rs[0];
    if(!on) return {err:'group not found'};
    on.focus();
    return { focusedOn:(on.innerText||'').trim(), groupSize:rs.length,
             active:(document.activeElement.innerText||'').trim() }; })()`);
  const state=()=>page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(e=>['Compact','Cozy','Comfortable'].includes((e.innerText||'').trim()))
      .map(e=>(e.innerText||'').trim()+'='+e.getAttribute('aria-checked')); })()`);
  const before = await state();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  const afterRight = await state();
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(700);
  const afterLeft = await state();
  return { groups, focused, before, afterRight, afterLeft,
           arrowMovesSelection: JSON.stringify(before)!==JSON.stringify(afterRight),
           arrowReturns: JSON.stringify(before)===JSON.stringify(afterLeft) };
};
