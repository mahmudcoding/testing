export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&!/\/rum/.test(u)&&r.request().method()!=='GET'){
      let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,52),s:r.status(),body:b});}};
  page.on('response',onResp);
  const tb=await page.$('[data-testid="call-toolbar"]');
  let opened=false;
  for(const b of await tb.$$('button')){ const l=((await b.getAttribute('aria-label'))||'').trim();
    if(l==='Send reaction'){ await b.click(); opened=true; break; } }
  await page.waitForTimeout(2500);
  let picked=null;
  const m=[...await page.$$('[role="menu"],[data-radix-popper-content-wrapper]')].pop();
  if(m){ const items=await m.$$('button');
    if(items.length){ picked=((await items[0].textContent())||'').trim().slice(0,6); await items[0].click(); } }
  await page.waitForTimeout(5000);
  page.off('response',onResp);
  return {opened, picked, reqs};
};
