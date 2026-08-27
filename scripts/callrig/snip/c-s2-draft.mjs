export default async ({page}) => {
  const ws='W4QCF1XTURESO01', A='C4QCGENERAL0001', B='C4QCPRIVATE0001';
  const comp=()=>page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const clear=async()=>{const c=comp();
    for(let k=0;k<6;k++){ if((await c.evaluate(e=>e.innerText.trim()))==='') return;
      await c.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
      await page.waitForTimeout(250);}};
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`);
  await page.waitForTimeout(11000);
  await clear();
  await comp().click();
  await page.keyboard.type('QA-DRAFT-A unsent text');
  await page.waitForTimeout(900);
  out.typedInA=await comp().evaluate(e=>e.innerText.trim().slice(0,26));
  // switch to another channel
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${B}`);
  await page.waitForTimeout(9000);
  out.composerInB=await comp().evaluate(e=>e.innerText.trim().slice(0,26));
  // come back
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`);
  await page.waitForTimeout(9000);
  out.backInA=await comp().evaluate(e=>e.innerText.trim().slice(0,26));
  out.draftSurvivedSwitch = out.backInA===out.typedInA;
  // full reload
  await page.reload(); await page.waitForTimeout(10000);
  out.afterReload=await comp().evaluate(e=>e.innerText.trim().slice(0,26));
  out.draftSurvivedReload = out.afterReload===out.typedInA;
  await clear();
  return out;
};
