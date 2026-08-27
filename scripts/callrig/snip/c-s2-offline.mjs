const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const out={};
  const snap=(t)=>page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    const mine=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-OFFLINE/.test(m.innerText||''));
    return {tag, online:navigator.onLine, n:document.querySelectorAll('[data-message-id]').length,
      composer: c? c.innerText.replace(/\n/g,'\\n').slice(0,40):null,
      offlineMsgs: mine.map(m=>({id:m.getAttribute('data-message-id').slice(-6),
        ctrl:[...m.querySelectorAll('button,[role="img"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.getAttribute('title')||'').trim()).filter(Boolean).slice(-2)})),
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,4),
      banner: (document.body.innerText.match(/[^\n]*(offline|reconnect|connection|no internet)[^\n]*/i)||[null])[0]};
  }, t);
  out.before = await snap('before');
  await page.context().setOffline(true);
  await page.waitForTimeout(3000);
  out.wentOffline = await snap('offline');
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-OFFLINE-1');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  out.sentOffline = await snap('sent-while-offline');
  await page.context().setOffline(false);
  await page.waitForTimeout(8000);
  out.backOnline = await snap('back-online');
  out.api = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=3',{credentials:'include'});
    const j=await r.json(); return (j.messages||[]).map(m=>(m.body||'').slice(0,26));
  });
  return out;
};
