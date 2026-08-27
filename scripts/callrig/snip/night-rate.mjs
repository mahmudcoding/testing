export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'&&!/\/rum/.test(u)){
      let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,56),s:r.status(),
                 post:(r.request().postData()||'').slice(0,120),body:b});}};
  page.on('response',onResp);
  const d=[...await page.$$('[role="dialog"]')].pop();
  let clicked=null;
  for(const b of await d.$$('button')){ const t=((await b.getAttribute('aria-label'))||'').trim();
    if(t===(process.env.QA_STARS||'4 stars')){ await b.click(); clicked=t; break; } }
  await page.waitForTimeout(3000);
  const mid = await page.evaluate(()=>{
    const dd=[...document.querySelectorAll('[role="dialog"]')].pop();
    return dd?{text:dd.innerText.replace(/\n+/g,' | ').slice(0,150),
      stars:[...dd.querySelectorAll('button')].filter(b=>/stars$/.test(b.getAttribute('aria-label')||''))
        .map(b=>({l:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed')}))}:null;});
  // then Done
  for(const b of await d.$$('button')){ const t=((await b.textContent())||'').trim();
    if(t==='Done'){ await b.click(); break; } }
  await page.waitForTimeout(4000);
  page.off('response',onResp);
  return {clicked, mid, reqs, dialogOpen: await page.evaluate(()=>!!document.querySelector('[role="dialog"]'))};
};
