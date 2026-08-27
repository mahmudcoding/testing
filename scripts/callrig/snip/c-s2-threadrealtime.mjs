export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-TRT parent', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  const reply=await page.evaluate(async(parent)=>{
    const r=await fetch(`/api/v1/messaging/messages/${parent}/reply`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({body:'QA-S2-TRT reply original', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, parent);
  const plain=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-TRT plain original', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.ids={parent,reply,plain};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(8000);
  const snap=()=>page.evaluate(({reply,plain})=>{
    const g=(id)=>{const e=document.querySelector(`[data-message-id="${id}"]`);
      return e? {txt:(e.innerText||'').replace(/\s+/g,' ').slice(-40),
        chips:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
          .filter(l=>l&&/react/i.test(l)&&!/Add reaction/.test(l)).length}:'absent';};
    return {reply:g(reply), plain:g(plain)};}, {reply,plain});
  out.before=await snap();
  // EDIT both, and REACT to both, in one go
  out.ops=await page.evaluate(async({ch,reply,plain})=>{
    const e1=await fetch(`/api/v1/messaging/channels/${ch}/messages/${reply}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({body:'QA-S2-TRT reply CHANGED'})});
    const e2=await fetch(`/api/v1/messaging/channels/${ch}/messages/${plain}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({body:'QA-S2-TRT plain CHANGED'})});
    const r1=await fetch(`/api/v1/messaging/channels/${ch}/messages/${reply}/reactions`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🍀'})});
    const r2=await fetch(`/api/v1/messaging/channels/${ch}/messages/${plain}/reactions`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🍀'})});
    return {editReply:e1.status, editPlain:e2.status, reactReply:r1.status, reactPlain:r2.status};}, {ch,reply,plain});
  const s=[]; for(let i=0;i<20;i++){ await page.waitForTimeout(1500); s.push(await snap()); }
  out.replyEditAt=s.findIndex(x=>/CHANGED/.test(x.reply.txt||''));
  out.plainEditAt=s.findIndex(x=>/CHANGED/.test(x.plain.txt||''));
  out.replyReactAt=s.findIndex(x=>(x.reply.chips||0)>0);
  out.plainReactAt=s.findIndex(x=>(x.plain.chips||0)>0);
  out.last=s.at(-1);
  await page.reload(); await page.waitForTimeout(8000);
  out.afterReload=await snap();
  return out;
};
