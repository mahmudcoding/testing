export default async ({page}) => {
  await page.waitForTimeout(16000);
  const live=await page.evaluate(()=>({log:(window.__d||[]).map(e=>`${e.t}s: ${e.v}`)}));
  const now=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    return {url:location.pathname.slice(-18), composer:!!c,
      composerEditable:c?c.getAttribute('contenteditable'):null,
      msgs:document.querySelectorAll('main [data-message-id]').length,
      tail:(main?(main.innerText||''):'').replace(/\s+/g,' ').trim().slice(-90),
      inSidebar:[...document.querySelectorAll('a[href*="/c/"]')].filter(v)
        .some(a=>(a.getAttribute('href')||'').includes('C4OXI650XQP3PQO')),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,60)).filter(Boolean).slice(0,2)};});
  // can she still type and send?
  let sendResult='not attempted';
  if(now.composer){
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
    await comp.click().catch(()=>{});
    await page.keyboard.type('QA-LIVEDEL after-delete');
    await page.waitForTimeout(700);
    const reqs=[];
    const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()==='POST') reqs.push(u.split('/api/v1')[1].slice(0,34));};
    page.on('request',onReq);
    await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(6000);
    page.off('request',onReq);
    sendResult=await page.evaluate((r)=>{
      const v=(e)=>{const r2=e.getBoundingClientRect();return r2.width>3&&r2.height>3;};
      const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
      return {posts:r, composerAfter:c?(c.innerText||'').trim().slice(0,26):'gone',
        toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').trim().slice(0,56)).filter(Boolean).slice(0,2)};}, reqs);
  }
  return {liveLog:live.log, afterDelete:now, sendAttempt:sendResult};
};
