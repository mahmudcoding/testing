export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&!/\/rum/.test(u)&&r.request().method()!=='GET'){
      let b=''; try{b=(await r.text()).slice(0,160);}catch(e){}
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,58),s:r.status(),
                 post:(r.request().postData()||'').slice(0,140),body:b});}};
  page.on('response',onResp);
  const d=[...await page.$$('[role="dialog"]')].pop();
  let clicked=null;
  for(const b of await d.$$('button')){ const t=((await b.textContent())||'').trim();
    if(t===(process.env.QA_BTN||'Save')){ if(!(await b.isDisabled())){ await b.click(); clicked=t; } else clicked='DISABLED'; break; } }
  await page.waitForTimeout(6000);
  page.off('response',onResp);
  return {clicked, reqs};
};
