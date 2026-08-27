// Watch the full-call screen (already reached) and count toast rising edges.
export default async ({page}) => {
  const secs=Number(process.env.QA_POLL_SECS||60);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const t0=Date.now(); const trace=[]; let prev=null; let edges=0; const seenIds=new Set();
  while((Date.now()-t0)/1000<secs){
    const s = await page.evaluate((v)=>{ const vis=eval(v);
      const li=[...document.querySelectorAll('[data-sonner-toast]')].filter(vis);
      const main=document.querySelector('main');
      return {n:li.length, ids: li.map(e=>e.getAttribute('data-sonner-toast')+'|'+(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)),
              screen:(main?(main.innerText||'').replace(/\n+/g,' | ').slice(0,90):'')}; }, V);
    s.ids.forEach(id=>seenIds.add(id));
    if(prev===null || s.n!==prev){ trace.push({t:+((Date.now()-t0)/1000).toFixed(1), n:s.n}); if(prev!==null && s.n>prev) edges+=(s.n-prev); prev=s.n; }
    await page.waitForTimeout(250);
  }
  return {secs, risingEdges: edges, distinctToastNodes: seenIds.size, trace: trace.slice(0,24),
          screen: (await page.evaluate(()=>{const m=document.querySelector('main'); return m?(m.innerText||'').replace(/\n+/g,' | ').slice(0,120):'';}))};
};
