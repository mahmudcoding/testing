export default async ({page}) => {
  const reqs=[]; const h=r=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.request().method()+' '+u.replace(/https?:\/\/[^/]+/,'').slice(0,90)+' -> '+r.status());};
  page.on('response',h);
  // click Open on e-arch-probe-2353 (the one WITH a message)
  const opens = page.locator('button:has-text("Open"), a:has-text("Open")');
  const n = await opens.count();
  await opens.nth(0).click();
  await page.waitForTimeout(3500);
  page.off('response',h);
  return await page.evaluate(({reqs,n})=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const main=document.querySelector('main')||document.body;
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const composer=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return {openCount:n, url:location.pathname, requests:reqs,
      messagesRendered: msgs.length,
      messageText: msgs.map(m=>m.innerText.replace(/\s+/g,' ').slice(0,60)),
      composerPresent: !!composer,
      composerEditable: composer? composer.getAttribute('contenteditable') : null,
      // banner / read-only notice: enumerate visible text in main, don't guess a selector
      mainText: main.innerText.replace(/\s+/g,' ').slice(0,500),
      controlsInMain: [...main.querySelectorAll('button,a,[role=button]')].filter(vis).map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,32)).slice(0,30)
    };
  },{reqs,n});
};
