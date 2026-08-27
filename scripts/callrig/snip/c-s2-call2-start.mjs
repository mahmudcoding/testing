export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const now=()=>new Date().toISOString();
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(7000);
  await page.locator('button[aria-label="Start call"]').first().click();
  out.startedAt=now();
  await page.waitForTimeout(parseInt(process.env.QA_HOLD||'13000',10)+9000);
  out.timerAtLeave=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)
      .find(x=>/Call with/.test(x.innerText||''));
    return d? ((d.innerText||'').match(/\d+:\d\d/)||[''])[0] : null;});
  if(process.env.QA_LEAVE==='navigate'){
    await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
    out.leftBy='navigate'; out.leftAt=now();
  } else {
    await page.locator('button[aria-label="Leave call"]').first().click();
    await page.waitForTimeout(1500);
    const dlg=page.locator('[role="alertdialog"], [role="dialog"]').filter({hasText:'Leave this call?'}).first();
    if(await dlg.count()) await dlg.locator('button').filter({hasText:/^Leave$/}).first().click();
    out.leftBy='button'; out.leftAt=now();
  }
  await page.waitForTimeout(3000);
  out.stillInCall=/\/call\//.test(page.url());
  return out;
};
