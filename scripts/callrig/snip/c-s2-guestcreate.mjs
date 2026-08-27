export default async ({page}) => {
  const out={};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
  const resp=[];
  const onRes=async(r)=>{const u=r.url();
    if(u.includes('/api/v1/channels')&&r.request().method()==='POST'){
      let b=''; try{b=(await r.text()).slice(0,120);}catch{}
      resp.push(r.status()+' '+b);}};
  page.on('request',onReq); page.on('response',onRes);
  await page.locator('button[aria-label="Add channel"]').first().click({timeout:6000}).catch(e=>{out.clickErr=String(e.message).slice(0,40);});
  await page.waitForTimeout(4000);
  out.dialog=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
    if(!d) return 'NO-DIALOG';
    return {text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,110),
      inputs:[...d.querySelectorAll('input')].filter(v).map(i=>i.getAttribute('placeholder')||'(none)').slice(0,3),
      buttons:[...new Set([...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.innerText||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,20)))].slice(0,8)};});
  if(out.dialog!=='NO-DIALOG'){
    const nm=page.locator('[role="dialog"] input').first();
    if(await nm.count()){
      await nm.fill('qa-c2-guestmade');
      await page.waitForTimeout(700);
      const create=page.locator('[role="dialog"] button').filter({hasText:/^(Create|Create channel)$/}).first();
      out.createBtn=await create.count();
      if(out.createBtn) await create.click({timeout:6000}).catch(()=>{});
      await page.waitForTimeout(8000);
    }
  }
  page.off('request',onReq); page.off('response',onRes);
  out.requests=reqs.slice(0,4); out.responses=resp.slice(0,2);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {url:location.pathname.slice(0,40),
      dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(v).length,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,60)).filter(Boolean).slice(0,2)};});
  return out;
};
