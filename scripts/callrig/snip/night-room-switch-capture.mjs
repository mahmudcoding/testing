export default async ({page}) => {
  const room=process.env.QA_ROOM||'QA-SR-1';
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&!/\/rum/.test(u)&&r.request().method()!=='GET'){
      let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,58),s:r.status(),body:b});}};
  page.on('response',onResp);
  const p=await page.$('[data-testid="call-side-panel-slot"]');
  if(!p){ page.off('response',onResp); return {err:'no panel'}; }
  let clicked=null;
  for(const r of await p.$$('li, div')){
    const t=((await r.innerText())||'').replace(/\s+/g,' ').trim();
    if(t.startsWith(room) && t.length<90){
      for(const b of await r.$$('button')){ const l=(((await b.getAttribute('aria-label'))||(await b.textContent())||'')).trim();
        if(l==='Switch'){ await b.click(); clicked=room; break; } }
      if(clicked) break; } }
  await page.waitForTimeout(4000);
  const dlg=await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')]
    .map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,120)).filter(t=>!/call-top-bar/.test(t) && t.length<300);
    return d.slice(-2);});
  page.off('response',onResp);
  return {clicked, reqs, dialogs:dlg, top: await page.evaluate(()=>{
    const tb=document.querySelector('[data-testid="call-top-bar"]');
    return tb?tb.innerText.replace(/\n+/g,' | ').slice(0,80):null;})};
};
