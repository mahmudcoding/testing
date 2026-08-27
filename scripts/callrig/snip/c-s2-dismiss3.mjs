export default async ({page}) => {
  const ws='W4QCF1XTURESO01', A='C4QCPRIVATE0001', B='C4QCGENERAL0001';
  const st=()=>page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const e=els.reverse().find(x=>/QA-PREVIEW2/.test(x.innerText||''));
    if(!e) return {found:false};
    return {found:true, links:e.querySelectorAll('a').length,
      hasCard:/external link/i.test(e.innerText||'')};});
  const out={dismissedNow:await st()};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${B}`); await page.waitForTimeout(8000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`); await page.waitForTimeout(12000);
  out.afterLeavingAndReturning=await st();
  await page.reload(); await page.waitForTimeout(12000);
  out.afterFullReload=await st();
  return out;
};
