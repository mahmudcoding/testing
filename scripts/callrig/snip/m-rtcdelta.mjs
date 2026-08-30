export default async ({page}) => {
  const grab = async ()=> await page.evaluate(async ()=>{
    const pcs=window.__pcs||[]; const out=[];
    for(let i=0;i<pcs.length;i++){ const pc=pcs[i]; if(pc.connectionState==='closed'){out.push(null);continue;}
      let s; try{s=await pc.getStats();}catch(e){out.push(null);continue;}
      const o={conn:pc.connectionState, in:{}, out:{}};
      s.forEach(r=>{ if(r.type==='inbound-rtp') o.in[r.ssrc+':'+r.kind]=r.bytesReceived;
                     if(r.type==='outbound-rtp') o.out[r.ssrc+':'+r.kind]=r.bytesSent; });
      out.push(o); }
    return out;
  });
  const a = await grab(); await page.waitForTimeout(8000); const b = await grab();
  const res = [];
  for (let i=0;i<Math.max(a.length,b.length);i++){
    const x=a[i], y=b[i]; if(!x||!y){res.push({pc:i, gone:true}); continue;}
    const d = {pc:i, conn:y.conn, inDelta:{}, outDelta:{}};
    for(const k of new Set([...Object.keys(x.in),...Object.keys(y.in)])){const v=(y.in[k]||0)-(x.in[k]||0); if(v>0)d.inDelta[k]=v;}
    for(const k of new Set([...Object.keys(x.out),...Object.keys(y.out)])){const v=(y.out[k]||0)-(x.out[k]||0); if(v>0)d.outDelta[k]=v;}
    res.push(d);
  }
  const ui = await page.evaluate(()=>{
    const t=[...document.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(x=>x.getAttribute('aria-label'));
    const hdr=[...document.querySelectorAll('header,[class*="header"]')].map(h=>(h.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean)[0];
    return {tiles:t, header:hdr&&hdr.slice(0,120)};
  });
  return {windowMs:8000, pcs:res, ui};
};
