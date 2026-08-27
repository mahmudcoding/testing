export default async ({page}) => {
  const ms=Number(process.env.QA_MS||30000);
  return await page.evaluate(async (ms)=>{
    const out=[]; const t0=Date.now(); let last='[]';
    const snap=()=>JSON.stringify([...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,160)).filter(Boolean));
    const micSnap=()=>{const tb=document.querySelector('[data-testid="call-toolbar"]');const m=tb?[...tb.querySelectorAll('button')].find(b=>/mute|unmute/i.test(b.getAttribute('aria-label')||'')):null;return m?m.getAttribute('aria-label')+'/'+m.getAttribute('aria-pressed'):'?';};
    let lastMic=micSnap();
    out.push({at:'0s', toasts:JSON.parse(snap()), mic:lastMic});
    while(Date.now()-t0<ms){
      await new Promise(r=>setTimeout(r,250));
      const s=snap(), m=micSnap();
      if(s!==last){ out.push({at:Math.round((Date.now()-t0)/100)/10+'s', toasts:JSON.parse(s)}); last=s; }
      if(m!==lastMic){ out.push({at:Math.round((Date.now()-t0)/100)/10+'s', mic:m}); lastMic=m; }
    }
    return {timeline: out};
  }, ms);
};
