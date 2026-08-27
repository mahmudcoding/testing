export default async ({page}) => {
  await page.waitForTimeout(18000);
  const live=await page.evaluate(()=>({log:(window.__k2||[]).map(e=>`${e.t}s: ${e.v}`)}));
  const now=await page.evaluate(async ()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    const r=await fetch('/api/v1/messaging/channels/C4OXIAPDMVKNB3E/messages?limit=3',{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {url:location.pathname.slice(-16), composer:!!c,
      composerEditable:c?c.getAttribute('contenteditable'):null,
      msgsInDom:document.querySelectorAll('main [data-message-id]').length,
      serverSays:{status:r.status, key:j&&j.key},
      inSidebar:[...document.querySelectorAll('a[href*="/c/"]')].filter(v)
        .some(a=>(a.getAttribute('href')||'').includes('C4OXIAPDMVKNB3E')),
      tail:(main?(main.innerText||''):'').replace(/\s+/g,' ').trim().slice(-80),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,60)).filter(Boolean).slice(0,2)};});
  let send='not attempted';
  if(now.composer){
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
    await comp.click().catch(()=>{});
    await page.keyboard.type('QA-KICK after-removal');
    await page.waitForTimeout(700);
    const posts=[];
    const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()==='POST') posts.push(u.split('/api/v1')[1].slice(0,30));};
    page.on('request',onReq);
    await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(6000);
    page.off('request',onReq);
    send=await page.evaluate((p)=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return {posts:p, toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,60)).filter(Boolean).slice(0,2)};}, posts);
  }
  return {liveLog:live.log, afterRemoval:now, sendAttempt:send};
};
