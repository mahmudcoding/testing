export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXI650XQP3PQO';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const snap=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    return {url:location.pathname.slice(-18), composer:!!c,
      msgs:document.querySelectorAll('main [data-message-id]').length,
      tail:(main?(main.innerText||''):'').replace(/\s+/g,' ').trim().slice(-70),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,50)).filter(Boolean).slice(0,2)};});
  const before=await snap();
  // poll from before the deletion
  await page.evaluate(()=>{
    const g=()=>{
      const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
      return `${location.pathname.slice(-14)}|composer=${!!c}|msgs=${document.querySelectorAll('main [data-message-id]').length}`;};
    window.__d=[{t:0,v:g()}]; const t0=Date.now();
    clearInterval(window.__dint);
    window.__dint=setInterval(()=>{const v=g(),L=window.__d;
      if(L[L.length-1].v!==v) L.push({t:Math.round((Date.now()-t0)/1000),v});
      if(L.length>25) clearInterval(window.__dint);},300);});
  return {viewing:before};
};
