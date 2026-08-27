export default async ({page}) => {
  const now=()=>new Date().toISOString();
  const out={before:now()};
  out.urlBefore=page.url().slice(-26);
  const btn=page.locator('button[aria-label="Leave call"]').first();
  out.leaveButtonFound=await btn.count();
  if(!out.leaveButtonFound) return out;
  out.timerBeforeLeave=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v).find(x=>/Call with/.test(x.innerText||''));
    return d? ((d.innerText||'').match(/\d+:\d\d/)||[''])[0]:null;});
  await btn.click();
  await page.waitForTimeout(1800);
  const dlg=page.locator('[role="alertdialog"], [role="dialog"]').filter({hasText:'Leave this call?'}).first();
  out.confirmFound=await dlg.count();
  if(out.confirmFound){
    await dlg.locator('button').filter({hasText:/^Leave$/}).first().click();
    out.leftAt=now();
  }
  await page.waitForTimeout(5000);
  out.urlAfter=page.url().slice(-26);
  out.stillInCall=/\/call\//.test(page.url());
  return out;
};
