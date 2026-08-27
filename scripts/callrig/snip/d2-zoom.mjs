const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out=[];
  for (const [zoom, cssW] of [[1,1920],[1.25,1536],[1.5,1280]]) {
    // emulate zoom by shrinking the CSS viewport, which is what a zoom does to layout
    await page.setViewportSize({ width: Math.round(cssW), height: Math.round(1080/zoom) });
    for (const path of ['account','privacy','admin/members']) {
      await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
      await page.waitForTimeout(1900);
      const m = await page.evaluate(`(() => { const vis=(${VIS});
        const de=document.documentElement; const main=document.querySelector('main')||document.body;
        const clipped=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
          .filter(e=>e.scrollWidth>e.clientWidth+1 && (e.innerText||'').trim().length>2)
          .filter(e=>{const ov=getComputedStyle(e).overflowX; return ov!=='auto'&&ov!=='scroll';});
        const offscreen=[...main.querySelectorAll('button,a[href],input,[role=switch],[role=combobox]')].filter(vis)
          .filter(e=>e.getBoundingClientRect().left>=innerWidth-1);
        return { sideways: de.scrollWidth>de.clientWidth, clipped:clipped.length,
          clippedSample: clipped.slice(0,2).map(e=>(e.innerText||'').trim().slice(0,24)),
          offscreen:offscreen.length }; })()`);
      out.push({ zoom:zoom+'x', cssWidth:cssW, path, ...m });
    }
  }
  await page.setViewportSize({ width:1920, height:1080 });
  return out;
};
