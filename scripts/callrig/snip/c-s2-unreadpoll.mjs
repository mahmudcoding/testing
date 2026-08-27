export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(9000);
  return page.evaluate(()=>{
    const grab=()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const row=[...document.querySelectorAll('a,button,[role="button"]')].filter(v)
        .find(e=>/^qa-general/i.test(((e.getAttribute('aria-label')||e.innerText||'')).trim()));
      if(!row) return 'NO-ROW';
      let op=1,n=row;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden'){op=0;break;} n=n.parentElement;}
      return `aria="${(row.getAttribute('aria-label')||'').slice(0,50)}" text="${(row.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)}" op=${+op.toFixed(2)}`;
    };
    window.__ulog=[{t:0,v:grab()}]; const t0=Date.now();
    clearInterval(window.__uint);
    window.__uint=setInterval(()=>{const v=grab(),L=window.__ulog;
      if(L[L.length-1].v!==v) L.push({t:Math.round((Date.now()-t0)/1000),v});
      if(L.length>40) clearInterval(window.__uint);},300);
    return {baseline:window.__ulog[0].v, viewing:location.pathname};
  });
};
