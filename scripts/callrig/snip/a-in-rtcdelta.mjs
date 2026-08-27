export default async ({page}) => {
  const grab = async ()=> await page.evaluate(async ()=>{
    const pcs=window.__pcs||[]; const m={};
    for(const pc of pcs){ let s; try{s=await pc.getStats();}catch(e){continue;}
      s.forEach(r=>{ if(r.type==='inbound-rtp') m['in:'+r.ssrc+':'+r.kind]=r.bytesReceived;
                     if(r.type==='outbound-rtp') m['out:'+r.ssrc+':'+r.kind]=r.bytesSent; }); }
    return m;
  });
  const a = await grab(); await page.waitForTimeout(6000); const b = await grab();
  const d = {};
  for(const k of new Set([...Object.keys(a),...Object.keys(b)])){
    const v=(b[k]||0)-(a[k]||0); if(v>0) d[k]=v;
  }
  const ui = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const p=[...r.querySelectorAll('[data-testid="call-side-panel-slot"]')][0];
    return {panel:p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,160):null,
      tiles:[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(x=>x.getAttribute('aria-label'))};
  });
  return {deltaBytesOver6s:d, ui};
};
