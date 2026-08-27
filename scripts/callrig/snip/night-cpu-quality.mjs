export default async ({page}) => {
  const rate=Number(process.env.QA_RATE||20);
  const ms=Number(process.env.QA_MS||70000);
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate});
  const out=await page.evaluate(async (ms)=>{
    const seen=[]; const t0=Date.now(); let last=null;
    const snap=()=>JSON.stringify({
      prompt:(p=>p?p.innerText.replace(/\n+/g,' | ').slice(0,220):null)(document.querySelector('[data-testid="call-quality-prompt-layer"]')),
      qualityIds:[...document.querySelectorAll('[data-testid*="quality" i]')].map(e=>e.getAttribute('data-testid')),
      net:(n=>n?n.innerText.replace(/\n+/g,'/'):null)(document.querySelector('[data-testid="call-network-indicator"]')),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,120)).filter(Boolean)
    });
    last=snap(); seen.push({at:'0s', state:JSON.parse(last)});
    while(Date.now()-t0<ms){ await new Promise(r=>setTimeout(r,1000)); const c=snap(); if(c!==last){ seen.push({at:Math.round((Date.now()-t0)/1000)+'s', state:JSON.parse(c)}); last=c; } }
    return seen;
  }, ms);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  return {throttleRate: rate, timeline: out};
};
