export default async ({page}) => {
  const src=process.env.QA_SRC;
  // 1. forward a different message from qa-general to qa-private
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const art=await page.$(`[data-message-id="${src}"]`);
  if(!art) return {err:'src not visible'};
  await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
  await page.evaluate((m)=>{const a=document.querySelector(`[data-message-id="${m}"]`);
    [...a.querySelectorAll('button')].find(x=>/^forward$/i.test((x.getAttribute('aria-label')||'').trim()))?.click();}, src);
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    const c=[...d.querySelectorAll('button,li,[role=option]')].filter(b=>b.getBoundingClientRect().width>0
      && /qa-private/.test((b.getAttribute('aria-label')||b.innerText||'')));
    c[c.length-1]?.click();});
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    [...d.querySelectorAll('button')].find(x=>/^continue$/i.test((x.innerText||'').trim()))?.click();});
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(d)[...d.querySelectorAll('button')].find(x=>/^send$/i.test((x.innerText||'').trim()))?.click();});
  await page.waitForTimeout(4000);
  // 2. in qa-private: unpin whatever is pinned, then pin the newest (forwarded) card
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBPRIVATE0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const menu = async (mid, re) => {
    const a=await page.$(`[data-message-id="${mid}"]`); if(!a) return 'missing';
    await a.hover().catch(()=>{}); await page.waitForTimeout(1500);
    await page.evaluate((m)=>{const el=document.querySelector(`[data-message-id="${m}"]`);
      [...el.querySelectorAll('button')].find(x=>/^more actions$/i.test((x.getAttribute('aria-label')||'').trim()))?.click();}, mid);
    await page.waitForTimeout(1200);
    return await page.evaluate((r)=>{const el=[...document.querySelectorAll('[role=menuitem]')]
      .find(b=>new RegExp(r,'i').test((b.innerText||'').trim()));
      if(!el) return null; const t=(el.innerText||'').trim(); el.click(); return t;}, re);
  };
  const info = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBPRIVATE0001/messages?limit=20',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    return {newest:arr[0]?.id, newestBody:(arr[0]?.body||''), newestFwd:!!arr[0]?.forwarded_from,
            fwdBody:(arr[0]?.forwarded_from?.body||'').slice(0,50),
            pinnedNow:(arr.find(m=>m.pinned)||{}).id||null};
  });
  if(info.pinnedNow) await menu(info.pinnedNow,'^unpin'), await page.waitForTimeout(3500);
  const pinned = await menu(info.newest,'^pin');
  await page.waitForTimeout(4500);
  const banner = await page.evaluate(()=>{
    const el=document.querySelector('[data-testid="pinned-messages-transition"]');
    if(!el) return {missing:true};
    let op=1,a=el; while(a){op=Math.min(op,parseFloat(getComputedStyle(a).opacity)); a=a.parentElement;}
    return {phase:el.dataset?.phase, effectiveOpacity:op, h:Math.round(el.getBoundingClientRect().height),
            text:(el.innerText||'').replace(/\s+/g,' ').slice(0,90)};
  });
  return {info, pinned, banner};
};
