export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  // post a fresh parent
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type('QA-C-THREAD-PARENT'); await page.keyboard.press('Enter');
  await page.waitForTimeout(2800);
  const parent = page.locator('[data-message-id]').last();
  const pid = await parent.getAttribute('data-message-id');
  const beforeCount = await page.evaluate(()=>document.querySelectorAll('[data-message-id]').length);
  await parent.hover(); await page.waitForTimeout(700);
  await parent.locator('button[aria-label="Reply"]').first().click();
  await page.waitForTimeout(2500);
  const panelOpen = await page.evaluate(v=>{const vv=eval(v);
    return {composers:[...document.querySelectorAll('div[contenteditable="true"]')].filter(vv).length,
      url:location.pathname+location.search,
      labels:[...document.querySelectorAll('div[contenteditable="true"]')].filter(vv).map(c=>c.getAttribute('aria-label'))};}, V);
  // type in the thread composer (the one that is NOT the channel composer)
  const tc = page.locator('div[contenteditable="true"]').filter({hasNot:page.locator('[aria-label="Compose message"]')});
  const all = page.locator('div[contenteditable="true"]');
  const n = await all.count();
  const threadComposer = all.nth(n-1);
  await threadComposer.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await threadComposer.type('QA-C-THREAD-REPLY-1');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3200);
  const after = await page.evaluate(async (args)=>{
    const [v,pid,ch]=args; const vv=eval(v);
    const r=await fetch(`/api/v1/messaging/messages/${pid}/thread?limit=20`,{credentials:'include'});
    const j=await r.json();
    const c=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'});
    const cj=await c.json(); const arr=cj.messages||cj.data||cj;
    return {threadStatus:r.status, replies:(j.replies||[]).map(x=>x.body),
      parentBody:(j.parent||{}).body,
      channelTop:(Array.isArray(arr)?arr:[]).slice(0,3).map(m=>m.body),
      domCount:document.querySelectorAll('[data-message-id]').length,
      replyMarkers:[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/^\d+ (reply|replies)$|^Replies/i.test(e.textContent.trim())&&vv(e)).map(e=>e.textContent.trim())};
  }, [V,pid,ch]);
  return {pid, beforeCount, panelOpen, after};
};
