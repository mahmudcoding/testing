export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const snap=()=>page.evaluate(()=>{
    const vis=(e)=>{ if(!e) return false; const r=e.getBoundingClientRect();
      if(r.width<2||r.height<2) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05; };
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const banners=[...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')]
      .filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,70)).filter(Boolean);
    const side=[...document.querySelectorAll('nav a, aside a')]
      .map(a=>(a.innerText||'').trim()).filter(t=>/qa-/.test(t));
    return {t:Date.now(), path:location.pathname.slice(-16),
      composer: !!(comp&&vis(comp)), msgs:document.querySelectorAll('main [data-message-id]').length,
      banners, inSidebar: side.some(s=>/qa-private/.test(s)),
      mainHead:(document.querySelector('main')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,70)};});
  const base=await snap();
  const series=[base];
  const t0=Date.now();
  while(Date.now()-t0 < 125000){
    await page.waitForTimeout(1800);
    series.push(await snap());
  }
  // collapse: keep only samples where something changed
  const key=(s)=>JSON.stringify([s.path,s.composer,s.msgs,s.banners,s.inSidebar,s.mainHead]);
  const out=[]; let prev=null;
  for(const s of series){ if(key(s)!==prev){ out.push({...s, at:+((s.t-t0)/1000).toFixed(1)}); prev=key(s);} }
  return {samples:series.length, baseline:base, changes:out.map(({t,...r})=>r)};
};
