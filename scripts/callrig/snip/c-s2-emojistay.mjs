export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  const out={};
  await page.locator('button[aria-label="Add emoji"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  const state=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const p=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].filter(v)
      .find(d=>/RECENTLY USED|Search emoji/i.test(d.innerText||''));
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return {pickerOpen:!!p, composer:c?(c.innerText||'').trim().slice(0,14):null};});
  out.afterOpen=await state();
  for (const e of ['🔥','⭐️']) {
    await page.locator(`button[aria-label="${e}"]`).first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(2200);
    out['afterPick_'+e]=await state();
  }
  return out;
};
