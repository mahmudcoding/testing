export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  await page.evaluate(()=>{
    window.__w2={s:[],t0:Date.now()};
    clearInterval(window.__w2Id);
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    window.__w2Id=setInterval(()=>{
      const h=document.querySelector('main header')||document.querySelector('header');
      const strip=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(t=>/Pinned|View all/i.test(t)&&t.length<30);
      window.__w2.s.push({t:Math.round((Date.now()-window.__w2.t0)/1000),
        header:(h?h.innerText:'').replace(/\s+/g,' ').slice(0,54),
        pinned:[...new Set(strip)].join('|'), vis:document.visibilityState});},1500);});
  return {watching:page.url()};
};
