export default async ({page}) => {
  const read=async()=>await page.evaluate(()=>{
    const g=(t)=>{const e=document.querySelector(`[data-testid="${t}"]`);
      return e?(e.getAttribute('aria-checked')||e.getAttribute('aria-pressed')):null;};
    const save=document.querySelector('[data-testid="meeting-settings-save"]');
    return {hostApproval:g('meeting-settings-entry-manual_admit'),
            anyone:g('meeting-settings-entry-open'),
            approvalSwitch:g('meeting-settings-approval-toggle'),
            saveDisabled: save?save.disabled:null};});
  const out={before: await read()};
  const tid=process.env.QA_TID||'meeting-settings-approval-toggle';
  await page.click(`[data-testid="${tid}"]`);
  await page.waitForTimeout(2500);
  out.afterClick={tid, ...(await read())};
  return out;
};
