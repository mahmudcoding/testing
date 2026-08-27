export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'&&!/\/rum/.test(u)){
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,50),s:r.status(),
                 post:(r.request().postData()||'').slice(0,120)});}};
  page.on('response',onResp);
  await page.click(`[data-testid="${process.env.QA_TID}"]`);
  await page.waitForTimeout(Number(process.env.QA_WAIT||5000));
  page.off('response',onResp);
  const st=await page.evaluate(()=>{
    const g=(t)=>{const e=document.querySelector(`[data-testid="${t}"]`);
      return e?(e.getAttribute('aria-checked')||e.getAttribute('aria-pressed')):null;};
    const s=document.querySelector('[data-testid="meeting-settings-save"]');
    return {hostApproval:g('meeting-settings-entry-manual_admit'), anyone:g('meeting-settings-entry-open'),
            approvalSwitch:g('meeting-settings-approval-toggle'), saveDisabled:s?s.disabled:null};});
  return {tid:process.env.QA_TID, reqs, state:st};
};
