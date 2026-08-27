export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  await page.evaluate(()=>{
    window.__rn={s:[],t0:Date.now()};
    clearInterval(window.__rnId);
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    window.__rnId=setInterval(()=>{
      const h=document.querySelector('main header')||document.querySelector('header');
      const a=[...document.querySelectorAll('a[href*="C4QCPRIVATE0001"]')].filter(vis)[0];
      window.__rn.s.push({t:Math.round((Date.now()-window.__rn.t0)/1000),
        header:(h?h.innerText:'').replace(/\s+/g,' ').slice(0,34),
        sidebar:a?(a.innerText||'').replace(/\s+/g,' ').slice(0,22):null,
        vis:document.visibilityState});},1500);});
  return {watching:page.url()};
};
