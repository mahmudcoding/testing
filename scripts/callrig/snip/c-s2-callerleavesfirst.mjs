export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const now=()=>new Date().toISOString();
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(7000);
  await page.locator('button[aria-label="Start call"]').first().click();
  out.startedAt=now();
  await page.waitForTimeout(16000);
  const btn=page.locator('button[aria-label="Leave call"]').first();
  out.leaveFound=await btn.count();
  if(out.leaveFound){
    out.timerBeforeLeave=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(v).find(x=>/Call with/.test(x.innerText||''));
      return d? ((d.innerText||'').match(/\d+:\d\d/)||[''])[0]:null;});
    await btn.click(); await page.waitForTimeout(1600);
    const dlg=page.locator('[role="alertdialog"], [role="dialog"]').filter({hasText:'Leave this call?'}).first();
    if(await dlg.count()) await dlg.locator('button').filter({hasText:/^Leave$/}).first().click();
    out.leftAt=now();
  }
  await page.waitForTimeout(3000);
  out.stillInCall=/\/call\//.test(page.url());
  return out;
};
