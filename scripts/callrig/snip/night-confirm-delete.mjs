export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{ const u=r.url();
    if(/\/api\/v1\//.test(u) && r.request().method()!=='GET'){
      reqs.push({m:r.request().method(), u:u.replace(/^https:\/\/[^/]+/,''), s:r.status()});}};
  page.on('response', onResp);
  const d=[...await page.$$('[role="dialog"],[role="alertdialog"]')].pop();
  let clicked=null;
  for(const b of await d.$$('button')){ const t=(((await b.getAttribute('aria-label'))||(await b.textContent())||'')).trim();
    if(t==='Delete meeting'){ await b.click(); clicked=t; break; } }
  await page.waitForTimeout(6000);
  page.off('response', onResp);
  return {clicked, reqs};
};
