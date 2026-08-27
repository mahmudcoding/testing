export default async ({page}) => {
  const now=()=>new Date().toISOString();
  const out={urlBefore:page.url().slice(-26)};
  const dlg=page.locator('[role="alertdialog"], [role="dialog"]').filter({hasText:'Leave this call?'}).first();
  out.dialogOpen=await dlg.count();
  if(out.dialogOpen){
    await dlg.locator('button').filter({hasText:/^Leave$/}).first().click();
    out.confirmedAt=now();
  } else {
    const b=page.locator('button[aria-label="Leave call"]').first();
    if(await b.count()){ await b.click(); await page.waitForTimeout(1600);
      const d2=page.locator('[role="alertdialog"], [role="dialog"]').filter({hasText:'Leave this call?'}).first();
      if(await d2.count()) await d2.locator('button').filter({hasText:/^Leave$/}).first().click();
      out.confirmedAt=now(); }
  }
  await page.waitForTimeout(5000);
  out.stillInCall=/\/call\//.test(page.url());
  out.urlAfter=page.url().slice(-26);
  return out;
};
