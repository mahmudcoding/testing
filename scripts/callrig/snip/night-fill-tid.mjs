export default async ({page}) => {
  await page.fill(`[data-testid="${process.env.QA_TID}"]`, process.env.QA_VAL||'');
  await page.waitForTimeout(1500);
  return {filled:process.env.QA_TID, saveDisabled: await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="meeting-settings-save"]'); return s?s.disabled:null;})};
};
