const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const runs=[];
  for (let k=0;k<3;k++) {
    const seen=[];
    const nav = page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'commit' }).catch(()=>{});
    for (let i=0;i<24;i++) {
      await page.waitForTimeout(220);
      try {
        const s = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
          const t=(main.innerText||'').replace(/\\s+/g,' ');
          const bar=[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(x=>/^(Save|Discard)/.test(x));
          return { unsaved:/unsaved/i.test(t), bar:bar.length, chars:t.length }; })()`);
        seen.push(s);
      } catch {}
    }
    await nav;
    runs.push({ run:k+1,
      everUnsaved: seen.some(s=>s.unsaved),
      everSaveBar: seen.some(s=>s.bar>0),
      samples: seen.length,
      firstFive: seen.slice(0,5).map(s=>`${s.unsaved?'U':'-'}${s.bar}`).join(' ') });
  }
  // and after save (ALK-3426's claim)
  return { falseIndicatorOnOpen: runs };
};
