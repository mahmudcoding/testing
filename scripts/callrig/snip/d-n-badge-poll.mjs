// Absolute-timestamped badge/notice poller.
export default async ({page}) => {
  const ms=+(process.env.QA_MS||120000), every=300;
  const t0=Date.now(); const changes=[]; let prev=null;
  while(Date.now()-t0<ms){
    const s = await page.evaluate(()=>{
      const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const b=document.querySelector('[data-testid="call-recording-badge"]');
      const toasts=[...document.querySelectorAll('[data-sonner-toast]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,80));
      return {badge: vis(b)?(b.innerText||'').trim():null, toasts, vs:document.visibilityState};
    });
    const k=JSON.stringify(s); if(k!==prev){changes.push({at:Date.now(),...s}); prev=k;}
    await page.waitForTimeout(every);
  }
  return {changes, t0, tEnd:Date.now()};
};
