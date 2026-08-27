export default async ({page}) => {
  const now=()=>new Date().toISOString();
  const out={before:now()};
  out.durationShown=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)
      .find(x=>/Call with/.test(x.innerText||''));
    return d? ((d.innerText||'').match(/\d+:\d\d/)||[''])[0] : null;});
  // click Leave INSIDE the confirmation dialog
  const dlg=page.locator('[role="alertdialog"], [role="dialog"]').filter({hasText:'Leave this call?'}).first();
  out.confirmDialogFound=await dlg.count();
  if(out.confirmDialogFound){
    await dlg.locator('button').filter({hasText:/^Leave$/}).first().click();
    out.leftAt=now();
    await page.waitForTimeout(4000);
  }
  out.urlAfter=page.url().slice(-26);
  out.stillInCall=/\/call\//.test(page.url());
  return out;
};
