export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  out.made=await page.evaluate(async(ch)=>{
    const txts=['QA-S2-PIN-alpha','QA-S2-PIN-beta','QA-S2-PIN-gamma'];
    const r=[];
    for(const t of txts){
      const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:ch, body:t, idempotency_key:'qap-'+Math.random().toString(36).slice(2)})});
      const j=await p.json();
      const q=await fetch(`/api/v1/messaging/channels/${ch}/messages/${j.id}/pin`,
        {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
         body:JSON.stringify({pin:true})});
      r.push({t, post:p.status, pin:q.status, id:j.id});
    }
    return r;}, ch);
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const va=page.locator('main button, main [role="button"]').filter({hasText:/View all/i}).first();
  const st=await va.evaluate(e=>{const r=e.getBoundingClientRect();
    const h=document.elementFromPoint(Math.round(r.left+r.width/2),Math.round(r.top+r.height/2));
    return {txt:e.innerText.replace(/\s+/g,' '), clickable:!!(h&&(h===e||e.contains(h)))};});
  out.viewAll=st;
  if(!st.clickable) return out;
  await va.click(); await page.waitForTimeout(2600);
  const panel=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('aside,[role="dialog"]')].filter(v)
      .filter(x=>/Pinned messages/.test(x.innerText||''))
      .sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
    if(!d) return null;
    const t=(d.innerText||'').replace(/\s+/g,' ');
    return {hits:(t.match(/QA-S2-PIN-\w+|QA-DEEP-\d{4}/g)||[]), tail:t.slice(-70)};});
  out.initial=await panel();
  const inp=page.locator('input[placeholder*="earch pinned"], input[aria-label*="earch pinned"]').first();
  out.hasSearch=await inp.count();
  if(out.hasSearch){
    for(const [k,q] of [['gamma','gamma'],['prefix','QA-S2-PIN'],['none','zzzznope'],['clear','']]){
      await inp.fill(q); await page.waitForTimeout(1900);
      out['search_'+k]=await panel();
    }
  }
  // unpin one from the panel
  const unpin=page.locator('button[aria-label="Unpin"]').first();
  out.unpinCount=await unpin.count();
  if(out.unpinCount){
    await unpin.click(); await page.waitForTimeout(3000);
    out.afterUnpin=await panel();
    out.pinnedApiAfter=await page.evaluate(async(ch)=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
      const j=await r.json().catch(()=>({}));
      return {total:j.total, n:(j.messages||[]).length};}, ch);
  }
  return out;
};
