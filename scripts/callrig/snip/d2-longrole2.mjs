const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  const assign = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/companies/roles/assign',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({role_id:'R4OXFIUIM4WG61A', user_id:'U4QDCAROL000001'})});
    return {s:r.status,t:(await r.text()).slice(0,80)};})()`);
  for (const wdt of [1280,1920]) {
    await page.setViewportSize({ width:wdt, height:900 });
    await page.reload({ waitUntil:'networkidle' });
    await page.waitForTimeout(2800);
  }
  const layout = await page.evaluate(`(() => { const vis=(${VIS});
    const de=document.documentElement;
    const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .map(tr=>[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim()));
    const carol=rows.find(c=>/Carol/i.test(c.join(' ')));
    const leaves=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis);
    const clipped=leaves.filter(e=>e.scrollWidth>e.clientWidth+1)
      .map(e=>({ t:(e.innerText||'').trim().slice(0,30), sw:e.scrollWidth, cw:e.clientWidth }));
    const offscreen=leaves.filter(e=>e.getBoundingClientRect().left>=innerWidth).length;
    return { viewport:innerWidth, pageScrollsSideways: de.scrollWidth>de.clientWidth,
             carolRow: carol? carol.join(' | ').slice(0,110):null,
             clipped: clipped.slice(0,4), clippedCount:clipped.length, offscreenLeaves:offscreen }; })()`);
  return { assign, layout };
};
