const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  const snap = (t) => page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const mine=msgs.filter(m=>/QA-S2-RETRY/.test(m.innerText||''));
    return {tag, n:msgs.length, composer:c?c.innerText.replace(/\n/g,'\\n').slice(0,40):null,
      retryMsgs: mine.map(m=>({id:m.getAttribute('data-message-id').slice(-6), text:m.innerText.replace(/\n+/g,' | ').slice(0,60),
        controls:[...m.querySelectorAll('button,[role="img"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.getAttribute('title')||'').trim()).filter(Boolean)})),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3)};
  }, t);
  out.before = await snap('before');
  await page.route('**/api/v1/messaging/messages', r => r.abort('failed'));
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-RETRY-ONE');
  await page.keyboard.press('Enter');
  const frames=[];
  for (let i=0;i<10;i++){ await page.waitForTimeout(700); frames.push(await snap('t'+i)); }
  out.whileBlocked = frames.filter((f,i)=> i===0 || JSON.stringify(f.retryMsgs)!==JSON.stringify(frames[i-1].retryMsgs) || f.composer!==frames[i-1].composer);
  await page.unroute('**/api/v1/messaging/messages');
  out.unrouted = await snap('after-unroute');
  return out;
};
