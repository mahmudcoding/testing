export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  out.setup=await page.evaluate(async(ch)=>{
    const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-MANYREACT', idempotency_key:'qmr-'+Math.random().toString(36).slice(2)})});
    const j=await p.json();
    const EM=['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','👍','👎','🎉','🚀','🔥','💯','✅','❌'];
    let ok=0, err=null;
    for(const e of EM){
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${j.id}/reactions`,{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify({emoji:e})});
      if(r.ok) ok++; else if(!err) err={emoji:e, status:r.status, body:(await r.text()).slice(0,90)};
    }
    return {id:j.id, applied:ok, tried:EM.length, firstErr:err};}, ch);
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  out.layout=await page.evaluate((id)=>{
    const el=document.querySelector(`main [data-message-id="${id}"]`);
    if(!el) return 'message not rendered';
    el.scrollIntoView({block:'center'});
    const r=el.getBoundingClientRect();
    const inner=window.innerWidth;
    const leaves=[...el.querySelectorAll('*')].filter(x=>x.children.length===0)
      .map(x=>{const b=x.getBoundingClientRect(); return {t:(x.textContent||'').trim().slice(0,10),
        right:Math.round(b.right), w:Math.round(b.width)};})
      .filter(x=>x.w>0);
    const chips=[...el.querySelectorAll('button,[role="button"]')]
      .filter(b=>/\d/.test(b.innerText||'') && (b.innerText||'').length<8);
    const rows=new Set(chips.map(c=>Math.round(c.getBoundingClientRect().top)));
    return {msgWidth:Math.round(r.width), msgRight:Math.round(r.right), viewport:inner,
      chipCount:chips.length, chipRows:rows.size,
      overflowsRight:leaves.some(l=>l.right>inner),
      docScrollWidth:document.documentElement.scrollWidth,
      elScroll:{sw:el.scrollWidth, cw:el.clientWidth},
      msgHeight:Math.round(r.height)};}, out.setup.id);
  return out;
};
