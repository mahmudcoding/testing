// Reload, click Join on a full call, and sample the toast stack through the attempt.
export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEETING;
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^(Join|Join call|Join now)$/i.test((x.innerText||'').trim()));
    if(b && !b.disabled){ b.click(); return true; } return false; }, V);
  const samples=[]; const t0=Date.now();
  while((Date.now()-t0)/1000 < 16){
    const s = await page.evaluate((v)=>{ const vis=eval(v);
      const li=[...document.querySelectorAll('[data-sonner-toast]')].filter(vis);
      const main=document.querySelector('main');
      return {n:li.length, txts:[...new Set(li.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)))],
              screen:(main?(main.innerText||'').replace(/\n+/g,' | ').slice(0,110):'')}; }, V);
    samples.push({t:+((Date.now()-t0)/1000).toFixed(1), ...s});
    await page.waitForTimeout(250);
  }
  const max = samples.reduce((a,b)=>b.n>a.n?b:a, samples[0]);
  const first = samples.find(s=>s.n>0);
  return {clicked, maxToasts: max.n, maxAt: max.t, maxTexts: max.txts,
          firstAt: first?first.t:null, screenAtMax: max.screen,
          trace: samples.filter((s,i)=>i===0||s.n!==samples[i-1].n).map(s=>({t:s.t,n:s.n}))};
};
