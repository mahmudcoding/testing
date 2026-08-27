export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const now=()=>new Date().toISOString();
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(7000);
  for(let i=0;i<110;i++){
    const b=page.locator('button').filter({hasText:/^(Accept|Join|Answer)$/}).first();
    if(await b.count()){ await b.click(); out.acceptedAt=now(); break; }
    await page.waitForTimeout(600);
  }
  if(!out.acceptedAt) return {err:'never saw an accept control'};
  await page.waitForTimeout(parseInt(process.env.QA_HOLD||'13000',10));
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
