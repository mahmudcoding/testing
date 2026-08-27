export default async ({page}) => {
  const ws='W4QCF1XTURESO01', id=process.env.MID;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`,{waitUntil:'load'});
  await page.waitForTimeout(3800);
  const t0=Date.now(); const seen=[]; let prev=null;
  for(let i=0;i<95;i++){ await page.waitForTimeout(300);
    const v=await page.evaluate(m=>{const x=document.querySelector(`[data-message-id="${m}"]`);
      return x? x.innerText.replace(/\s+/g,' ').trim().slice(0,60) : 'GONE';}, id);
    if(v!==prev){ seen.push({t:Date.now()-t0, v}); prev=v; } }
  return {changes: seen};
};
