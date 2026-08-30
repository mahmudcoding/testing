export default async ({page}) => {
  const ms=+(process.env.QA_MS||40000), every=500;
  const t0=Date.now(); const changes=[]; let prev=null;
  while(Date.now()-t0<ms){
    const s = await page.evaluate(()=>{
      const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/record|stop in/i.test((x.getAttribute('aria-label')||'')+' '+(x.innerText||'')));
      return b.map(x=>({l:(x.getAttribute('aria-label')||x.innerText||'').trim().replace(/\s+/g,' '),tid:x.dataset.testid||null,dis:String(x.disabled)+'/'+x.getAttribute('aria-disabled')}));
    });
    const k=JSON.stringify(s); if(k!==prev){changes.push({ms:Date.now()-t0,b:s}); prev=k;}
    await page.waitForTimeout(every);
  }
  return {changes};
};
