export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  return page.evaluate(()=>{
    const grab=()=>[...document.querySelectorAll('[aria-live]')]
      .map(e=>(e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean);
    window.__a11y=[]; const t0=Date.now();
    clearInterval(window.__a11yint);
    window.__a11yint=setInterval(()=>{
      grab().forEach(t=>{ if(!window.__a11y.some(x=>x.v===t))
        window.__a11y.push({t:Math.round((Date.now()-t0)/1000), v:t.slice(0,120)}); });
      if(window.__a11y.length>25) clearInterval(window.__a11yint);},300);
    return {liveRegions:document.querySelectorAll('[aria-live]').length,
      initial:grab().slice(0,2)};});
};
