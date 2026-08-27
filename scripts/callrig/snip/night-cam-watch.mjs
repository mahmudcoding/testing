export default async ({page}) => {
  const ms=Number(process.env.QA_MS||30000);
  return await page.evaluate(async (ms)=>{
    const out=[]; const t0=Date.now(); let last=null;
    const snap=()=>{
      const tb=document.querySelector('[data-testid="call-toolbar"]');
      const c=tb?[...tb.querySelectorAll('button')].find(b=>/camera/i.test(b.getAttribute('aria-label')||'')):null;
      return JSON.stringify({
        cam: c?c.getAttribute('aria-label')+'/dis='+c.disabled:'absent',
        toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,140)).filter(Boolean)
      });
    };
    last=snap(); out.push({at:'0s', state:JSON.parse(last)});
    while(Date.now()-t0<ms){ await new Promise(r=>setTimeout(r,250)); const c=snap(); if(c!==last){ out.push({at:Math.round((Date.now()-t0)/100)/10+'s', state:JSON.parse(c)}); last=c; } }
    return {timeline: out};
  }, ms);
};
