export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const rec=page.locator('button[aria-label="Record voice message"]');
  out.recBtn=await rec.count();
  if(!out.recBtn) return out;
  await rec.first().click(); await page.waitForTimeout(4000);
  out.duringRecord=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('button')].filter(vis)
      .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,20))
      .filter(l=>l&&/stop|send|cancel|record|delete|pause/i.test(l));});
  return out;
};
