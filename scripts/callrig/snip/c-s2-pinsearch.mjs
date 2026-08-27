export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  // post 4 distinctive messages and pin them all
  out.made=await page.evaluate(async(ch)=>{
    const txts=['QA-S2-PIN-alpha','QA-S2-PIN-beta','QA-S2-PIN-gamma','QA-S2-PIN-delta'];
    const ids=[];
    for(const t of txts){
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:ch, body:t, idempotency_key:'qap-'+Math.random().toString(36).slice(2)})});
      const j=await r.json(); ids.push({t, id:j.id});
      const p=await fetch(`/api/v1/messaging/channels/${ch}/messages/${j.id}/pin`,
        {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
         body:JSON.stringify({pin:true})});
      ids[ids.length-1].pin=p.status;
    }
    return ids;}, ch);
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const va=page.locator('main button, main [role="button"]').filter({hasText:/View all/i}).first();
  out.viewAllText=await va.count()? (await va.innerText()).replace(/\s+/g,' ') : null;
  await va.click(); await page.waitForTimeout(2600);
  const panel=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('aside,[role="dialog"]')].filter(v)
      .filter(x=>/Pinned messages/.test(x.innerText||''))
      .sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
    if(!d) return null;
    const t=(d.innerText||'').replace(/\s+/g,' ');
    return {entries:(t.match(/QA-S2-PIN-\w+/g)||[]),
      empty:/no |nothing|not found|нет/i.test(t)? t.slice(0,80):null};});
  out.panelInitial=await panel();
  const inp=page.locator('input[placeholder="Search pinned messages"], input[aria-label="Search pinned messages"]').first();
  out.hasSearch=await inp.count();
  if(out.hasSearch){
    await inp.fill('gamma'); await page.waitForTimeout(1800);
    out.searchGamma=await panel();
    await inp.fill('QA-S2-PIN'); await page.waitForTimeout(1800);
    out.searchPrefix=await panel();
    await inp.fill('zzzznope'); await page.waitForTimeout(1800);
    out.searchNone=await panel();
    await inp.fill(''); await page.waitForTimeout(1500);
    out.afterClear=await panel();
  }
  return out;
};
