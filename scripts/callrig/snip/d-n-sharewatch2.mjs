// Watches share tiles + WS frames, reports sample health.
export default async ({page}) => {
  const ms=+(process.env.QA_MS||60000), every=300;
  await page.evaluate(()=>{ if(window.__ws) window.__ws.length=0; });
  const t0=Date.now(); const changes=[]; let prev=null; let samples=0;
  while(Date.now()-t0<ms){
    samples++;
    const s = await page.evaluate(()=>{
      const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const thumbs=[...new Set([...document.querySelectorAll('[data-testid="share-thumbnail"],[data-testid="screen-share-thumbnail"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim()))];
      return {tracks:[...document.querySelectorAll('[data-testid="screen-share-track"]')].filter(vis).length,
        thumbs, vs:document.visibilityState};
    });
    const k=JSON.stringify(s); if(k!==prev){changes.push({at:Date.now(),...s}); prev=k;}
    await page.waitForTimeout(every);
  }
  const ws = await page.evaluate(()=>{
    const all=(window.__ws||[]);
    return {total:all.length,
      share: all.filter(f=>/screen|share|track_pub|publish/i.test(f.d||'')).map(f=>({at:f.at,d:(f.d||'').slice(0,300)})).slice(0,20)};
  });
  const dur=Date.now()-t0;
  return {health:{samples, durMs:dur, expected:Math.round(dur/every), effectiveIntervalMs:Math.round(dur/samples)}, changes, ws};
};
