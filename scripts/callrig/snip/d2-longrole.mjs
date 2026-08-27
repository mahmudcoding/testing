const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const NAME=('D2 '+'Lorem ipsum dolor sit amet consectetur adipiscing elit sed'.repeat(2)).slice(0,64);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  const made = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/companies/O4QDF1XTURESO01/roles',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:${JSON.stringify(NAME)},permissions:['company.O4QDF1XTURESO01.member.view']})});
    const t=await r.text(); let j=null; try{j=JSON.parse(t)}catch{};
    return { status:r.status, id:j&&j.id, nameLen:${NAME.length}, body:t.slice(0,120) };})()`);
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const layout = await page.evaluate(`(() => { const vis=(${VIS});
    const de=document.documentElement;
    const leaves=[...document.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis);
    const clipped=leaves.filter(e=>e.scrollWidth>e.clientWidth+1)
      .map(e=>({ t:(e.innerText||'').trim().slice(0,26), sw:e.scrollWidth, cw:e.clientWidth }));
    const scrollers=[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);
      return e.scrollWidth-e.clientWidth>4 && /auto|scroll/.test(s.overflowX) && vis(e);}).length;
    return { pageScrollsSideways: de.scrollWidth>de.clientWidth,
             docWidth:de.scrollWidth, viewport:de.clientWidth,
             clippedLeaves: clipped.slice(0,5), clippedCount: clipped.length,
             horizontalScrollers: scrollers }; })()`);
  return { made, layout };
};
