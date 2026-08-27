export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&!/\/rum/.test(u)&&r.request().method()!=='GET')
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,48),s:r.status(),
                 post:(r.request().postData()||'').slice(0,90)});};
  page.on('response',onResp);
  // 1. batched field: meeting name
  await page.fill('[data-testid="meeting-settings-name-input"]', process.env.QA_NAME||'QA CANCEL TEST');
  await page.waitForTimeout(1200);
  const afterName=await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="meeting-settings-save"]');
    const c=[...document.querySelectorAll('[data-testid="meeting-settings-panel"] button')].find(b=>(b.textContent||'').trim()==='Cancel');
    return {saveDisabled:s?s.disabled:null, cancelDisabled:c?c.disabled:null};});
  // 2. instant control: mic mode back to allowed
  await page.click('[data-testid="meeting-settings-mic-mode-allowed_all"]');
  await page.waitForTimeout(3000);
  // 3. Cancel
  const cancel=[...await page.$$('[data-testid="meeting-settings-panel"] button')];
  let cancelled=null;
  for(const b of cancel){ if(((await b.textContent())||'').trim()==='Cancel'){ await b.click(); cancelled=true; break; } }
  await page.waitForTimeout(4000);
  page.off('response',onResp);
  return {afterName, cancelled, reqs};
};
