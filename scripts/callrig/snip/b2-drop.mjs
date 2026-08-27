export default async ({page, ctx}) => {
  const OFF = Number(process.env.QA_OFF_SECS || 35);
  const cdp = await ctx.newCDPSession(page);
  const snap = async () => await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(v).map(e=>e.getAttribute('data-testid')))].filter(t=>/recover|banner|network|notice|error|lifecycle|ended|call-surface|toast/i.test(t));
    const main=document.querySelector('main')||document.body;
    return {ids, txt:(main.innerText||'').replace(/\n+/g,' | ').slice(0,260), btns:[...main.querySelectorAll('button')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,18)};
  }).catch(e=>({err:String(e).slice(0,60)}));
  const tl=[]; let last='';
  const push = async (phase) => { const s=await snap(); const sig=JSON.stringify(s); if(sig!==last){ tl.push({phase, t:+((Date.now()-t0)/1000).toFixed(1), ...s}); last=sig; } };
  const t0=Date.now();
  await push('before');
  await cdp.send('Network.emulateNetworkConditions', {offline:true, latency:0, downloadThroughput:0, uploadThroughput:0});
  const t1=Date.now();
  while((Date.now()-t1)/1000 < OFF){ await push('offline'); await page.waitForTimeout(400); }
  await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:0, downloadThroughput:-1, uploadThroughput:-1});
  const t2=Date.now();
  while((Date.now()-t2)/1000 < 30){ await push('online'); await page.waitForTimeout(400); }
  return {changes: tl.length, timeline: tl.slice(0,16)};
};
