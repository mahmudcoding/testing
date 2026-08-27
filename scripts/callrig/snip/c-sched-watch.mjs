export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const TITLE=process.env.QA_TITLE||'QA-C-SCHED-1';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  const t0=Date.now(); const rows=[];
  const dur = +(process.env.QA_DUR||300000);
  while (Date.now()-t0 < dur) {
    const s = await page.evaluate((title)=>{
      const m=document.querySelector('main')||document.body;
      const txt=(m.innerText||'');
      const i=txt.indexOf(title);
      const seg = i<0? null : txt.slice(i, i+180).replace(/\n+/g,' | ');
      const card=[...m.querySelectorAll('*')].find(e=>e.children.length && (e.innerText||'').includes(title) && (e.innerText||'').length<400);
      const btns = card? [...card.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).slice(0,6) : [];
      return {seg, btns, clock: new Date().toISOString().slice(11,19)};
    }, TITLE);
    rows.push({ms:Date.now()-t0, ...s});
    await page.waitForTimeout(1000);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.seg,r.btns]); if(k!==prev){cond.push(r);prev=k;}}
  return {samples:rows.length, changes: cond.slice(0,25)};
};
