export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const pinned=await page.evaluate(async (ch)=>{
    const mk=async(body)=>{const r=await fetch('/api/v1/messaging/messages',{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch,body})});
      const j=await r.json(); return j.id||j.message?.id;};
    const ids=[];
    for (const b of ['QA-PINTAB-alpha','QA-PINTAB-beta','QA-PINTAB-gamma']){
      const id=await mk(b); ids.push({b,id});
      await new Promise(r=>setTimeout(r,1200));
      await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',
        credentials:'include',headers:{'content-type':'application/json'},
        body:JSON.stringify({pin:true})});
      await new Promise(r=>setTimeout(r,800));
    }
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    const j=await r.json();
    return {created:ids.map(x=>x.b), serverTotal:j&&j.total};
  }, ch);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Pinned/}).first().click({timeout:6000});
  await page.waitForTimeout(5000);
  const list=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const pane=[...document.querySelectorAll('div,section')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.72&&b.width>250&&b.height>200;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    return {tab:[...document.querySelectorAll('button[aria-selected="true"]')]
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,14)).join(','),
      hits:(pane?(pane.innerText||''):'').match(/QA-PINTAB-\w+/g)||[],
      paneText:pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,160):'NO-PANE'};});
  const out={setup:pinned, afterOpen:await list()};
  const search=page.locator('input[placeholder="Search pinned messages"]').first();
  out.searchPresent=await search.count();
  if(out.searchPresent){
    await search.fill('beta'); await page.waitForTimeout(3500);
    out.afterSearchBeta=await list();
    await search.fill('zzzznone'); await page.waitForTimeout(3500);
    out.afterSearchNoMatch=await list();
    await search.fill(''); await page.waitForTimeout(3000);
    out.afterClear=await list();
  }
  return out;
};
