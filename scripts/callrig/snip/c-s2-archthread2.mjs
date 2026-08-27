export default async ({page}) => {
  const out={};
  const pid=await page.evaluate(()=>new URLSearchParams(location.search).get('thread'));
  out.parent=pid;
  out.threadApi=await page.evaluate(async (pid)=>{
    const r=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {status:r.status, replies:j&&j.replies?j.replies.length:null,
      parentBody:j&&j.parent?(j.parent.body||'').slice(0,20):null};}, pid);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<6;i++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  await comp.click();
  await page.keyboard.type('QA-ATHR-SEND probe');
  await page.waitForTimeout(900);
  out.typed=await comp.evaluate(e=>e.innerText.trim().slice(0,24));
  const events=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&/messages/.test(u)&&r.method()==='POST')
    events.push('REQ '+r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
  const onRes=async(r)=>{const u=r.url();
    if(u.includes('/api/v1/')&&/messages/.test(u)){let b='';try{b=(await r.text()).slice(0,120);}catch{}
      if(r.request().method()==='POST') events.push('RES '+r.status()+' '+b);}};
  page.on('request',onReq); page.on('response',onRes);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{out.sendFail=true});
  await page.waitForTimeout(7000);
  page.off('request',onReq); page.off('response',onRes);
  out.sendEvents=events.slice(0,4);
  out.afterSend=await page.evaluate(async (pid)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const r=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    return {replies:j&&j.replies?j.replies.length:null,
      composerText:c?(c.innerText||'').trim().slice(0,24):null,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,60)).filter(Boolean).slice(0,2)};}, pid);
  return out;
};
