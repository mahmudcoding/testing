// bob (blocked BY carol) tries to open a DM with carol and send a message.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  await page.locator('main').getByText('QA Carol',{exact:true}).first().click();
  await page.waitForTimeout(2200);
  const card = await page.evaluate(() => {
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return d?{text:d.innerText.replace(/\s+/g,' ').slice(0,200), btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,25),dis:b.disabled}))}:{noDialog:true};
  });
  await page.locator('[role=dialog] button', {hasText:/^Message$/}).first().click();
  await page.waitForTimeout(3500);
  const afterMsg = await page.evaluate(() => {
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const m=document.querySelector('main')||document.body;
    return {url:location.pathname, main:m.innerText.replace(/\s+/g,' ').slice(0,400),
      composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis).map(t=>t.innerText.replace(/\s+/g,' ').trim().slice(0,120)).filter(Boolean)};
  });
  let send=null;
  if(afterMsg.composer){
    const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
    await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
    await comp.type('QA-C-BLOCKED-PING');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    send = await page.evaluate(() => {
      const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
        let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
      return {msgs:[...document.querySelectorAll('[data-message-id]')].map(m=>m.innerText.replace(/\s+/g,' ').slice(0,60)).slice(-3),
        toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis).map(t=>t.innerText.replace(/\s+/g,' ').trim().slice(0,120)).filter(Boolean),
        composerText:(document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')||{}).innerText};
    });
  }
  return {cardOfCarol: card, afterMessageClick: afterMsg, afterSend: send};
};
