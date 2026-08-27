const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const state = `(() => { try { return JSON.parse(localStorage.getItem('aloqa.appearance')||'{}'); } catch { return {}; } })()`;
  const go=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`,{waitUntil:'networkidle'});
                      await page.waitForTimeout(2600); };
  const out={};
  await go();
  // locate the "Message layout" label, then take the Compact radio nearest BELOW it
  out.pick = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const label=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .find(e=>(e.innerText||'').trim()==='Message layout');
    if(!label) return {err:'label not found'};
    const ly=label.getBoundingClientRect().top;
    const cands=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(x=>(x.innerText||'').trim()==='Compact')
      .map(x=>({el:x, dy:x.getBoundingClientRect().top-ly}))
      .filter(c=>c.dy>=0).sort((a,b)=>a.dy-b.dy);
    if(!cands.length) return {err:'no Compact below the label'};
    return { labelY:Math.round(ly), candidates:cands.map(c=>Math.round(c.dy)),
             chosenDy:Math.round(cands[0].dy) }; })()`);
  out.click = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const label=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .find(e=>(e.innerText||'').trim()==='Message layout');
    const ly=label.getBoundingClientRect().top;
    const c=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(x=>(x.innerText||'').trim()==='Compact')
      .map(x=>({el:x, dy:x.getBoundingClientRect().top-ly})).filter(c=>c.dy>=0)
      .sort((a,b)=>a.dy-b.dy)[0];
    c.el.click(); return { clickedAtDy:Math.round(c.dy) }; })()`);
  await page.waitForTimeout(1800);
  out.storedRightAfter = (await page.evaluate(state)).msgLayout;
  out.savePanelVisible = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button')].filter(vis).some(b=>/^Save/i.test((b.innerText||'').trim())); })()`);
  await go();
  out.storedAfterReload = (await page.evaluate(state)).msgLayout;
  out.shownAfterReload = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const label=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .find(e=>(e.innerText||'').trim()==='Message layout');
    const ly=label.getBoundingClientRect().top;
    return [...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(x=>/^(Standard|Compact)$/.test((x.innerText||'').trim()))
      .map(x=>({t:(x.innerText||'').trim(), dy:Math.round(x.getBoundingClientRect().top-ly), on:x.getAttribute('aria-checked')}))
      .filter(x=>x.dy>=0 && x.dy<160); })()`);
  return out;
};
