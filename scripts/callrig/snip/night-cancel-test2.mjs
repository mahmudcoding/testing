export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&!/\/rum/.test(u)&&r.request().method()!=='GET')
      reqs.push({u:u.replace(/^https:\/\/[^/]+/,'').slice(0,44),s:r.status(),post:(r.request().postData()||'').slice(0,70)});};
  page.on('response',onResp);
  await page.click('[data-testid="meeting-settings-reactions"]');
  await page.waitForTimeout(2500);
  await page.fill('[data-testid="meeting-settings-name-input"]','QA CANCEL 2');
  await page.waitForTimeout(1200);
  for(const b of await page.$$('[data-testid="meeting-settings-panel"] button')){
    if(((await b.textContent())||'').trim()==='Cancel'){ await b.click(); break; } }
  await page.waitForTimeout(4000);
  page.off('response',onResp);
  return {reqs};
};
