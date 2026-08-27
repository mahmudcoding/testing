export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&!/\/rum/.test(u)&&r.request().method()!=='GET'){
      let b=''; try{b=(await r.text()).slice(0,150);}catch(e){}
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,58),s:r.status(),
                 post:(r.request().postData()||'').slice(0,120),body:b});}};
  page.on('response',onResp);
  const d=[...await page.$$('[role="dialog"]')].pop();
  if(!d) return {err:'no dialog'};
  // first group is Microphone; take its Block button (3rd button after Close)
  const btns=await d.$$('button');
  const labels=[];
  for(const b of btns) labels.push(((await b.textContent())||'').trim().slice(0,12));
  const idx=labels.findIndex((l,i)=>l==='Block' && i>0);
  let clicked=null;
  if(idx>=0){ await btns[idx].click(); clicked='Block#'+idx; }
  await page.waitForTimeout(5000);
  page.off('response',onResp);
  return {clicked, labels:labels.slice(0,9), reqs};
};
