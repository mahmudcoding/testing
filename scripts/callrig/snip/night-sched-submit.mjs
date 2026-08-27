export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{ const u=r.url();
    if(/\/api\/v1\//.test(u) && r.request().method()!=='GET'){
      let b=''; try{ b=(await r.text()).slice(0,200);}catch(e){}
      reqs.push({m:r.request().method(), u:u.replace(/^https:\/\/[^/]+/,''), s:r.status(),
                 post:(r.request().postData()||'').slice(0,220), body:b});}};
  page.on('response', onResp);
  const d=await page.$$('[role="dialog"]'); const dlg=d[d.length-1];
  const btns=await dlg.$$('button');
  let clicked=null;
  for(const b of btns){ const t=((await b.textContent())||'').trim();
    if(/^Schedule meeting$/.test(t)){ await b.click(); clicked=t; break; } }
  await page.waitForTimeout(7000);
  page.off('response', onResp);
  const after = await page.evaluate(()=>{
    const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
    const vis=[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')]
      .filter(e=>{const r=e.getBoundingClientRect();
        return e.innerText.trim() && !/sr-only/.test((e.className||'').toString()) && r.width>20 && r.height>10;})
      .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,70));
    return {dialogStillOpen: !!dd, dialogText: dd?dd.innerText.replace(/\n+/g,' | ').slice(0,120):null, toasts:vis};
  });
  return {clicked, reqs, after};
};
