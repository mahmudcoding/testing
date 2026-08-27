export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('input,textarea')].filter(v).map(e=>({
      tag:e.tagName, type:e.type||'', id:e.id||'',
      aria:e.getAttribute('aria-label')||'', ph:e.getAttribute('placeholder')||'',
      val:(e.value||'').slice(0,24)}));});
};
