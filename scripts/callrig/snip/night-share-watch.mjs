export default async ({page}) => {
  const ms=Number(process.env.QA_MS||35000);
  return await page.evaluate(async (ms)=>{
    const out=[]; const t0=Date.now(); let last=null;
    const snap=()=>{
      const b=document.querySelector('[data-testid="call-controls-screen-share"]');
      return JSON.stringify({
        share: b?b.getAttribute('aria-label')+'/dis='+b.disabled:'absent',
        toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,140)).filter(Boolean),
        dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded').map(m=>m.innerText.replace(/\n+/g,' | ').slice(0,120))
      });
    };
    last=snap(); out.push({at:'0s', state:JSON.parse(last)});
    while(Date.now()-t0<ms){
      await new Promise(r=>setTimeout(r,250));
      const c=snap(); if(c!==last){ out.push({at:Math.round((Date.now()-t0)/100)/10+'s', state:JSON.parse(c)}); last=c; }
    }
    return {timeline: out};
  }, ms);
};
