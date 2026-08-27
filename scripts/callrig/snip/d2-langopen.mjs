const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const snap=()=>page.evaluate(`(() => { const vis=(${VIS});
    return { bodyLen:(document.body.innerText||'').length,
      ctlCount:[...document.querySelectorAll('button,[role],a,input,li')].filter(vis).length,
      roles:[...new Set([...document.querySelectorAll('[role]')].filter(vis).map(e=>e.getAttribute('role')))],
      expanded:(()=>{const b=[...document.querySelectorAll('button')].filter(vis)
        .filter(e=>(e.innerText||'').trim()==='English')[0];
        return b?{exp:b.getAttribute('aria-expanded'), hp:b.getAttribute('aria-haspopup'), ctrls:b.getAttribute('aria-controls')}:null;})() }; })()`);
  const before = await snap();
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>(e.innerText||'').trim()==='English');
    if(b.length===1) b[0].click(); })()`);
  await page.waitForTimeout(2200);
  const after = await snap();
  const newText = await page.evaluate(`(() => { const vis=(${VIS});
    const pop=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox],[role=menu],[role=dialog],ul')].filter(vis);
    return pop.map(e=>({tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
      text:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,160),
      kids:[...e.querySelectorAll('*')].filter(vis).filter(x=>!x.children.length)
        .map(x=>(x.innerText||'').trim()).filter(Boolean).slice(0,8) })).slice(0,4); })()`);
  return { before, after, popups:newText };
};
