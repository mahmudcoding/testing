export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const id=process.env.QA_CH;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`);
  await page.waitForTimeout(12000);
  const before=await page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    return {composer:!!c, msgs:document.querySelectorAll('main [data-message-id]').length,
      archivedBanner:/archived/i.test(main?(main.innerText||''):'')};});
  await page.evaluate(()=>{
    const g=()=>{
      const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
      const main=document.querySelector('main');
      return `composer=${!!c}|banner=${/archived/i.test(main?(main.innerText||''):'')}|url=${location.pathname.slice(-12)}`;};
    window.__a=[{t:0,v:g()}]; const t0=Date.now();
    clearInterval(window.__aint);
    window.__aint=setInterval(()=>{const v=g(),L=window.__a;
      if(L[L.length-1].v!==v) L.push({t:Math.round((Date.now()-t0)/1000),v});
      if(L.length>25) clearInterval(window.__aint);},300);});
  return {viewing:before};
};
