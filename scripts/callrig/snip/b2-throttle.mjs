// Heavy network throttling mid-call, watching for the connection-recovery banner.
export default async ({page, ctx}) => {
  const cdp = await ctx.newCDPSession(page);
  const snap = () => page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(v).map(e=>e.getAttribute('data-testid')))];
    const net=document.querySelector('[data-testid="call-network-indicator"]');
    const surf=document.querySelector('[data-testid="call-surface"]');
    return {recovery: ids.filter(t=>/recover|reconnect|banner|lifecycle|network/i.test(t)),
            net: net?(net.innerText||'').replace(/\s+/g,' ').trim().slice(0,40):null,
            inCall: !!surf,
            toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,80)).filter(Boolean))]};
  }).catch(e=>({err:1}));
  const tl=[]; let last='';
  const push=async(phase,t)=>{ const s=await snap(); const sig=JSON.stringify(s); if(sig!==last){ tl.push({phase,t,...s}); last=sig; } };
  await push('before',0);
  // brutal: 1 kbps, 3s latency
  await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:3000, downloadThroughput:1024, uploadThroughput:1024});
  const t0=Date.now();
  while((Date.now()-t0)/1000 < 50){ await push('throttled', +((Date.now()-t0)/1000).toFixed(1)); await page.waitForTimeout(1500); }
  await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:0, downloadThroughput:-1, uploadThroughput:-1});
  const t1=Date.now();
  while((Date.now()-t1)/1000 < 25){ await push('restored', +((Date.now()-t1)/1000).toFixed(1)); await page.waitForTimeout(1500); }
  return {changes: tl.length, timeline: tl.slice(0,12)};
};
