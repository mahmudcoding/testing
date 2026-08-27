const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page, ctx}) => {
  const out={};
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  // Slow 3G-ish
  await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:400,
    downloadThroughput: 50*1024, uploadThroughput: 20*1024});
  await page.goto('about:blank'); await page.waitForTimeout(700);
  const t0 = Date.now();
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'domcontentloaded'});
  out.domReadyMs = Date.now()-t0;
  // sample loading states from early on
  const frames=[];
  for (let i=0;i<20;i++){
    await page.waitForTimeout(1500);
    frames.push(await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
        let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
      const t=document.body.innerText;
      return {n:document.querySelectorAll('[data-message-id]').length,
        composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
        loading:/loading|Loading/.test(t), error:/could not|failed|error|try again/i.test(t),
        notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2)};
    }));
    if (frames[frames.length-1].n > 0 && frames[frames.length-1].composer) break;
  }
  out.loadFrames = frames.filter((f,i)=> i===0 || JSON.stringify(f)!==JSON.stringify(frames[i-1]));
  out.loadedAfterMs = Date.now()-t0;
  // send a message under throttle
  if (frames[frames.length-1].composer) {
    const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type('QA-S2-SLOWNET');
    const ts=Date.now();
    await page.keyboard.press('Enter');
    const sendFrames=[];
    for (let i=0;i<12;i++){
      await page.waitForTimeout(1200);
      sendFrames.push(await page.evaluate(()=>{
        const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
        const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-SLOWNET/.test(m.innerText||''));
        return {count:el.length, ctrl: el.length? [...el[el.length-1].querySelectorAll('button,[role="img"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.getAttribute('title')||'').trim()).filter(Boolean).slice(-1):[],
          toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2)};
      }));
      const l=sendFrames[sendFrames.length-1];
      if (l.count && /Sent/.test(l.ctrl.join(''))) break;
    }
    out.sendMs = Date.now()-ts;
    out.sendFrames = sendFrames.filter((f,i)=> i===0 || JSON.stringify(f)!==JSON.stringify(sendFrames[i-1]));
  }
  await cdp.send('Network.emulateNetworkConditions', {offline:false, latency:0, downloadThroughput:-1, uploadThroughput:-1});
  await cdp.detach();
  return out;
};
