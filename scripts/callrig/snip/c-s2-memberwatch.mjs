export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  await page.evaluate(()=>{
    window.__mw={s:[],t0:Date.now()};
    clearInterval(window.__mwId);
    window.__mwId=setInterval(()=>{
      const h=document.querySelector('main header')||document.querySelector('header');
      window.__mw.s.push({t:Math.round((Date.now()-window.__mw.t0)/1000),
        header:(h?h.innerText:'').replace(/\s+/g,' ').slice(0,50),
        vis:document.visibilityState});},1500);});
  return {watching:page.url()};
};
