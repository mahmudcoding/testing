export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; };
    const all=[...document.querySelectorAll('button,a,[role=button],[role=link],input,select,summary,[tabindex]:not([tabindex="-1"])')];
    return {
      url: location.href,
      totalInteractive: all.length,
      visibleInteractive: all.filter(vis).map(e=>({tag:e.tagName, t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), al:e.getAttribute('aria-label'), href:e.getAttribute('href')})),
      hiddenInteractive: all.filter(e=>!vis(e)).map(e=>({tag:e.tagName, t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)})).slice(0,10),
      bodyText: document.body.innerText.replace(/\s+/g,' ').trim().slice(0,300)
    };
  });
};
