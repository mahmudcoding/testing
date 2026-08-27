export default async ({page}) => {
  const before = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-screen-share');
    return b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'), disabled:b.disabled}:{err:'no share btn'};
  });
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-screen-share'); if(b)b.click();});
  await page.waitForTimeout(9000);
  const after = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-screen-share');
    return {btn:b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed')}:null,
      gdm:(window.__gdmCalls||[]).length,
      head:((r.innerText||'').replace(/\n+/g,' | ')).slice(0,200),
      dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(vis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded').map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,120))};
  });
  const stats = await page.evaluate(async ()=>{
    const pcs=window.__pcs||[]; const v=[];
    for(const pc of pcs){ let s; try{s=await pc.getStats();}catch(e){continue;}
      s.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video') v.push({bytes:r.bytesSent, frames:r.framesEncoded, w:r.frameWidth, h:r.frameHeight}); }); }
    return v;
  });
  return {before, after, outboundVideo: stats};
};
