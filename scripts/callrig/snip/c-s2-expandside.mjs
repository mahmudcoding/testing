export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(7500);
  const out={};
  out.before=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return {collapse:[...document.querySelectorAll('button')].filter(vis)
      .map(b=>b.getAttribute('aria-label')).filter(l=>l&&/sidebar/i.test(l)),
      addChannel:[...document.querySelectorAll('button')].filter(vis)
        .some(b=>/Add channel/.test(b.getAttribute('aria-label')||'')),
      sideLinks:document.querySelectorAll('nav a, aside a').length};});
  const exp=page.locator('button[aria-label*="sidebar"]').first();
  if(await exp.count()){ await exp.click(); await page.waitForTimeout(2000); }
  out.after=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return {collapse:[...document.querySelectorAll('button')].filter(vis)
      .map(b=>b.getAttribute('aria-label')).filter(l=>l&&/sidebar/i.test(l)),
      addChannel:[...document.querySelectorAll('button')].filter(vis)
        .some(b=>/Add channel/.test(b.getAttribute('aria-label')||'')),
      sideLinks:document.querySelectorAll('nav a, aside a').length};});
  return out;
};
