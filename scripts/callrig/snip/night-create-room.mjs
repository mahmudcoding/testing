export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&!/\/rum/.test(u)&&r.request().method()!=='GET'){
      let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
      reqs.push({u:u.replace(/^https:\/\/[^/]+/,'').slice(0,52),s:r.status(),body:b});}};
  page.on('response',onResp);
  const d=[...await page.$$('[role="dialog"]')].pop();
  if(!d) return {err:'no dialog'};
  const inp=await d.$('input[type="text"], input:not([type])');
  if(inp) await inp.fill(process.env.QA_ROOM||'QA-ROOM');
  await page.waitForTimeout(900);
  let clicked=null, labels=[];
  for(const b of await d.$$('button')){ const t=((await b.textContent())||'').trim(); labels.push(t.slice(0,18));
    if(/^(Create room|Create|Create side room)$/i.test(t)){ if(!(await b.isDisabled())){ await b.click(); clicked=t; } else clicked='DISABLED'; break; } }
  await page.waitForTimeout(5000);
  page.off('response',onResp);
  return {clicked, labels:labels.slice(-6), reqs};
};
