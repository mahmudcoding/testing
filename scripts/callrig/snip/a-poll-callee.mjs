export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const frames = [];
  const t0 = Date.now();
  for (let i=0;i<110;i++) {
    const f = await page.evaluate(() => {
      const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
        return r.width>2 && r.height>2 && s.visibility!=='hidden' && s.display!=='none' && Number(s.opacity)>0.01; };
      const ov = [...document.querySelectorAll('body *')].filter(e=>{
        const s = getComputedStyle(e);
        return (s.position==='fixed') && vis(e) && Number(s.zIndex||0) > 5 && (e.innerText||'').trim().length>0;
      }).map(e=>(e.getAttribute('data-testid')||e.tagName)+':'+(e.innerText||'').replace(/\n+/g,' ').slice(0,70));
      return ov.join(' ~~ ').slice(0,300);
    });
    frames.push({ms: Date.now()-t0, f});
    await page.waitForTimeout(300);
  }
  // collapse
  const trail=[]; let last=null;
  for (const x of frames) { if (x.f !== last) { trail.push(x); last = x.f; } }
  return {frames: frames.length, trail: trail.slice(0,25)};
};
