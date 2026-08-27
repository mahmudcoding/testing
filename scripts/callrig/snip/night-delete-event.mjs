export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{ const u=r.url();
    if(/\/api\/v1\//.test(u) && r.request().method()!=='GET'){
      reqs.push({m:r.request().method(), u:u.replace(/^https:\/\/[^/]+/,''), s:r.status()});}};
  page.on('response', onResp);
  const d=[...await page.$$('[role="dialog"],[data-radix-popper-content-wrapper]')].pop();
  if(!d) return {err:'no popover'};
  let clicked=null;
  for(const b of await d.$$('button')){ const t=(((await b.getAttribute('aria-label'))||(await b.textContent())||'')).trim();
    if(t==='Delete'){ await b.click(); clicked=t; break; } }
  await page.waitForTimeout(3000);
  const confirm = await page.evaluate(()=>{
    const dd=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].pop();
    return dd?{text:dd.innerText.replace(/\n+/g,' | ').slice(0,160),
      buttons:[...dd.querySelectorAll('button')].map(b=>(b.textContent||'').trim().slice(0,20))}:null;});
  page.off('response', onResp);
  return {clicked, confirm, reqs};
};
