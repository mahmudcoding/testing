export default async ({page}) => {
  const grab=async()=>await page.evaluate(async()=>{
    const pcs=window.__pcs||[]; const m={};
    for(const pc of pcs){ let s; try{s=await pc.getStats();}catch(e){continue;}
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='video') m['v:'+r.ssrc]={bytes:r.bytesReceived,frames:r.framesDecoded,w:r.frameWidth,h:r.frameHeight}; }); }
    return m;});
  const a=await grab(); await page.waitForTimeout(5000); const b=await grab();
  const delta={};
  for(const k of Object.keys(b)){ const p=a[k]||{bytes:0,frames:0};
    delta[k]={bytes:b[k].bytes-p.bytes, frames:b[k].frames-p.frames, size:b[k].w+'x'+b[k].h}; }
  const ui=await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {head:((r.innerText||'').replace(/\n+/g,' | ')).slice(0,180),
      videos:[...r.querySelectorAll('video')].filter(v=>v.getClientRects().length).map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused}))};
  });
  return {deltaOver5s:delta, ui};
};
