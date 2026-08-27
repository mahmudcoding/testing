export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(9000);
  return page.evaluate(()=>{
    const grab=()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const b=[...document.querySelectorAll('button,a,[role="button"]')].filter(v)
        .find(x=>/pin/i.test(x.getAttribute('aria-label')||x.innerText||''));
      if(!b) return 'NO-BANNER';
      let n=b; for(let i=0;i<3&&n.parentElement;i++) n=n.parentElement;
      return (n.innerText||'').replace(/\s+/g,' ').trim().slice(0,120);
    };
    window.__pinlog=[{t:0,v:grab()}]; const t0=Date.now();
    clearInterval(window.__pinint);
    window.__pinint=setInterval(()=>{
      const v=grab(), L=window.__pinlog;
      if(L[L.length-1].v!==v) L.push({t:Math.round((Date.now()-t0)/1000),v});
      if(L.length>60) clearInterval(window.__pinint);
    },300);
    return {baseline:window.__pinlog[0].v, url:location.pathname,
            msgs:document.querySelectorAll('main [data-message-id]').length};
  });
};
