const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(10000);
  const snap=(t)=>page.evaluate((tag)=>{
    const ids=[...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id'));
    const counts={}; ids.forEach(i=>counts[i]=(counts[i]||0)+1);
    const dups=Object.entries(counts).filter(([,c])=>c>1).map(([i,c])=>({id:i.slice(-6),c}));
    let sc=null; for (const e of document.querySelectorAll('div')) {
      if (e.scrollHeight>e.clientHeight+40 && e.clientHeight>300 && e.querySelector('[data-message-id]')) { sc=e; break; } }
    return {tag, n:ids.length, uniq:new Set(ids).size, dups:dups.slice(0,4),
      scroll: sc?{top:Math.round(sc.scrollTop), h:Math.round(sc.scrollHeight), ch:Math.round(sc.clientHeight)}:null,
      pageOverflow: document.documentElement.scrollWidth>document.documentElement.clientWidth};
  }, t);
  const out=[];
  out.push(await snap('initial'));
  const box = await page.evaluate(()=>{
    for (const e of document.querySelectorAll('div')) {
      if (e.scrollHeight>e.clientHeight+40 && e.clientHeight>300 && e.querySelector('[data-message-id]')) {
        const r=e.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)}; } }
    return null;
  });
  if (box) {
    for (let cycle=0; cycle<3; cycle++){
      for (let i=0;i<8;i++){ await page.mouse.move(box.x, box.y); await page.mouse.wheel(0,-1200); await page.waitForTimeout(500); }
      await page.waitForTimeout(2000);
      out.push(await snap(`up-${cycle+1}`));
      for (let i=0;i<8;i++){ await page.mouse.move(box.x, box.y); await page.mouse.wheel(0, 1200); await page.waitForTimeout(500); }
      await page.waitForTimeout(2000);
      out.push(await snap(`down-${cycle+1}`));
    }
  }
  const bad = out.filter(s=>s.dups.length || s.pageOverflow);
  return {box, steps: out.map(s=>({tag:s.tag, n:s.n, uniq:s.uniq, dups:s.dups.length, top:s.scroll&&s.scroll.top, h:s.scroll&&s.scroll.h})), problems: bad};
};
