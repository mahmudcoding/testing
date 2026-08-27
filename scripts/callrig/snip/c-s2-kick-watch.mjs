export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXIAPDMVKNB3E';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const before=await page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    return {url:location.pathname.slice(-16), composer:!!c,
      msgs:document.querySelectorAll('main [data-message-id]').length};});
  await page.evaluate(()=>{
    const g=()=>{
      const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
      return `${location.pathname.slice(-14)}|composer=${!!c}|msgs=${document.querySelectorAll('main [data-message-id]').length}`;};
    window.__k2=[{t:0,v:g()}]; const t0=Date.now();
    clearInterval(window.__k2int);
    window.__k2int=setInterval(()=>{const v=g(),L=window.__k2;
      if(L[L.length-1].v!==v) L.push({t:Math.round((Date.now()-t0)/1000),v});
      if(L.length>25) clearInterval(window.__k2int);},300);});
  return {viewing:before};
};
