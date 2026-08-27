export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(0,120));
  const st=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return {label:b?b.getAttribute('aria-label'):'gone', pressed:b?b.getAttribute('aria-pressed'):null};});
  const pick=async(text)=>{
    const h=await page.evaluateHandle((t)=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button,button')].filter(v)
        .find(b=>(b.innerText||'').trim()===t)||null;}, text);
    const el=h.asElement(); if(!el) return 'not found';
    await el.click({timeout:6000}).catch(()=>{}); return 'clicked';
  };
  const run=async(duration)=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(11000);
    const reqs=[];
    const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
      reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
    page.on('request',onReq);
    await page.locator('button[aria-label="Mute notifications"]').first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(2500);
    const picked=await pick(duration);
    await page.waitForTimeout(5000);
    const stored=await ls(); const afterMute=await st();
    const muteReqs=reqs.length;
    // now try to unmute through the UI, without reloading
    await page.locator('button[aria-label="Unmute notifications"]').first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(5000);
    page.off('request',onReq);
    return {duration, picked, storedValue:stored.replace(/.*mutedByChannel":/,'').slice(0,42),
      afterMute, muteRequests:muteReqs, totalRequests:reqs.length,
      afterUnmuteClick:await st(), lsAfterUnmute:(await ls()).replace(/.*mutedByChannel":/,'').slice(0,42)};
  };
  const a=await run('For 1 hour');
  // clean slate before the second case
  await page.evaluate(async (ch)=>{
    await fetch(`/api/v1/notifications/channels/${ch}/mute`,{method:'DELETE',credentials:'include'});
    try{const k='aloqa.channel.mute';const o=JSON.parse(localStorage.getItem(k)||'{}');
      if(o&&o.state)  {o.state.mutedByChannel={};localStorage.setItem(k,JSON.stringify(o));}}catch(e){}}, ch);
  const b=await run('Until turned off');
  await page.evaluate(async (ch)=>{
    await fetch(`/api/v1/notifications/channels/${ch}/mute`,{method:'DELETE',credentials:'include'});
    try{const k='aloqa.channel.mute';const o=JSON.parse(localStorage.getItem(k)||'{}');
      if(o&&o.state){o.state.mutedByChannel={};localStorage.setItem(k,JSON.stringify(o));}}catch(e){}}, ch);
  return {hourCase:a, untilTurnedOffCase:b};
};
