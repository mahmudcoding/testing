export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{ const u=r.url();
    if(/\/api\/v1\//.test(u) && r.request().method()!=='GET'){
      let b=''; try{ b=(await r.text()).slice(0,150);}catch(e){}
      reqs.push({m:r.request().method(), u:u.replace(/^https:\/\/[^/]+/,''), s:r.status(),
                 post:(r.request().postData()||'').slice(0,200), body:b});}};
  page.on('response', onResp);
  const d=await page.$$('[role="dialog"]'); const dlg=d[d.length-1];
  const title=await dlg.$('input[aria-label="Add title"]');
  if(title){ await title.click({clickCount:3}); await title.fill(process.env.QA_TITLE||'QA SCHED EDITED'); }
  const btns=await dlg.$$('button');
  for(const b of btns){ if(((await b.textContent())||'').trim()===(process.env.QA_DUR||'2 hr')){ await b.click(); break; } }
  await page.waitForTimeout(1500);
  const labels=[];
  let saved=null;
  for(const b of await dlg.$$('button')){ const t=((await b.textContent())||'').trim(); labels.push(t.slice(0,20));
    if(/^(Save|Save changes|Update|Update meeting)$/i.test(t)){ await b.click(); saved=t; break; } }
  await page.waitForTimeout(6000);
  page.off('response', onResp);
  return {saved, buttonLabels:labels.slice(-8), reqs,
    dialogOpen: await page.evaluate(()=>!!document.querySelector('[role="dialog"]'))};
};
