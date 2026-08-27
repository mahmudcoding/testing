export default async ({page}) => {
  const c = await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^Turn camera on$/i.test(x.getAttribute('aria-label')||''));
    if(!b) return {err:'no cam btn'}; if(b.disabled) return {err:'disabled'}; b.click(); return {ok:true};});
  await page.waitForTimeout(6000);
  const after = await page.evaluate(async ()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^Turn camera (on|off)$/i.test(x.getAttribute('aria-label')||''));
    let out=[]; for(const pc of (window.__pcs||[])){ let s; try{s=await pc.getStats();}catch(e){continue;}
      s.forEach(q=>{ if(q.type==='outbound-rtp'&&q.kind==='video') out.push({bytes:q.bytesSent,frames:q.framesEncoded,size:q.frameWidth+'x'+q.frameHeight}); }); }
    return {btn:b?b.getAttribute('aria-label'):null, outVideo:out};
  });
  return {c, after};
};
