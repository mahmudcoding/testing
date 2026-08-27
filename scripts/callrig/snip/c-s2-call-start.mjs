export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const out={};
  const now=()=>new Date().toISOString();
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(8000);
  await page.locator('button[aria-label="Start call"]').first().click();
  out.startedAt=now();
  await page.waitForTimeout(3000);
  // a confirm/start dialog may appear
  const go=page.locator('button').filter({hasText:/^(Start call|Start|Call)$/}).first();
  if(await go.count()){ await go.click(); out.confirmedAt=now(); await page.waitForTimeout(2000); }
  out.urlAfterStart=page.url().slice(-24);
  await page.waitForTimeout(16000);
  const leave=page.locator('button[aria-label="Leave call"], button[aria-label="End call"]').first();
  out.leaveFound=await leave.count();
  if(out.leaveFound){
    await leave.click(); out.leftAt=now(); await page.waitForTimeout(2500);
    const conf=page.locator('button[data-testid="call-end-confirm-submit"], button').filter({hasText:/^(Leave|Leave call|End)$/}).first();
    if(await conf.count()){ await conf.click(); await page.waitForTimeout(2000); }
  } else {
    out.callButtons=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('button')].filter(v)
        .map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,20);});
  }
  out.finalUrl=page.url().slice(-24);
  return out;
};
