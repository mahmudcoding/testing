export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(6500);
  return page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const m=document.querySelector('main');
    return {url:location.pathname,
      txt:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,320),
      rows:document.querySelectorAll('main [data-message-id]').length,
      buttons:[...document.querySelectorAll('main button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,22)).slice(0,20),
      tabs:[...document.querySelectorAll('[role="tab"]')].filter(vis).map(t=>(t.innerText||'').slice(0,16))};
  });
};
