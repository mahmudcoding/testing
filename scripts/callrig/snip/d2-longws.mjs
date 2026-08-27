const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const NAME=process.env.D2_WSNAME||'QA Workspace D';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/workspace`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  const set = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/workspaces/W4QDF1XTURESO01',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({name:${JSON.stringify(NAME)}})});
    const t=await r.text(); return {s:r.status, len:${NAME.length}, body:t.slice(0,110)};})()`);
  if (set.s!==200) return { set };
  const out={ set };
  for (const wdt of [1280,1920]) {
    await page.setViewportSize({ width:wdt, height:900 });
    await page.goto(`https://airion-cargo.store/w/${W}/c/C4QDGENERAL0001`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2800);
    out[wdt] = await page.evaluate(`(() => { const vis=(${VIS});
      const de=document.documentElement;
      const leaves=[...document.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis);
      const clipped=leaves.filter(e=>e.scrollWidth>e.clientWidth+1)
        .map(e=>({ t:(e.innerText||'').trim().slice(0,30), sw:e.scrollWidth, cw:e.clientWidth }));
      const offscreen=leaves.filter(e=>e.getBoundingClientRect().left>=innerWidth)
        .map(e=>(e.innerText||'').trim().slice(0,24));
      return { viewport:innerWidth, sideways:de.scrollWidth>de.clientWidth,
               clippedCount:clipped.length, clipped:clipped.slice(0,5),
               offscreenCount:offscreen.length, offscreen:offscreen.slice(0,3) }; })()`);
  }
  await page.setViewportSize({ width:1280, height:900 });
  return out;
};
