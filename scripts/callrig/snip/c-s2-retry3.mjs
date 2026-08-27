const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const snap = (t) => page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const lost=msgs.filter(m=>/QA-S2-LOST/.test(m.innerText||''));
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return {tag, domN:msgs.length, lostCount:lost.length,
      lost: lost.map(m=>({id:m.getAttribute('data-message-id').slice(-6),
        controls:[...m.querySelectorAll('button,[role="img"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.getAttribute('title')||'').trim()).filter(Boolean)})),
      composer: c?c.innerText.replace(/\n/g,'\\n').slice(0,40):null,
      bodyHasLost: /QA-S2-LOST/.test(document.body.innerText)};
  }, t);
  await page.route('**/api/v1/messaging/messages', r => r.abort('failed'));
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.type('QA-S2-LOST-ON-RELOAD');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);
  out.failed = await snap('failed');
  // full reload with the route still blocked, then unblock
  await page.unroute('**/api/v1/messaging/messages');
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  out.afterReload = await snap('after-reload');
  out.api = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=10',{credentials:'include'});
    const j=await r.json(); return (j.messages||[]).filter(m=>/LOST/.test(m.body||'')).map(m=>m.body);
  });
  return out;
};
