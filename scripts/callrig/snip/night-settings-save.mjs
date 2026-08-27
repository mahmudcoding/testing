export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){
      let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,60),s:r.status(),
                 post:(r.request().postData()||'').slice(0,200),body:b});}};
  page.on('response',onResp);
  await page.click('[data-testid="meeting-settings-save"]');
  await page.waitForTimeout(5000);
  page.off('response',onResp);
  return {reqs};
};
