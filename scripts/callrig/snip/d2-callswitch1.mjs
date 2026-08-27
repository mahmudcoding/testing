const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/calls`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const full = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    return (i>=0?t.slice(i+1):t).trim(); })()`);
  const sw = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    return l.map((e,ix)=>{ const r=e.getBoundingClientRect();
      // nearest preceding visible text in document order
      const walker=document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      let prev='', node;
      while((node=walker.nextNode())){ const p=node.parentElement; if(!p||!vis(p)) continue;
        const pr=p.getBoundingClientRect();
        if (pr.top < r.top+2 && (node.textContent||'').trim()) prev=(node.textContent||'').trim(); }
      return { ix, y:Math.round(r.top), checked:e.getAttribute('aria-checked'),
               aria:e.getAttribute('aria-label')||'', labelledby:e.getAttribute('aria-labelledby')||'',
               id:e.id||'', nearestTextAbove:prev.slice(0,60) }; }); })()`);
  const storageAll = await page.evaluate(`(() => { const o={};
    for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i);
      if(/call|audio|push|noise|mic|echo/i.test(k)) o[k]=(localStorage.getItem(k)||'').slice(0,200); }
    return o; })()`);
  return { pageText:full.slice(0,600), switches:sw, callRelatedStorage:storageAll };
};
