export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-DELPROP parent', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  const reply=await page.evaluate(async(parent)=>{
    const r=await fetch(`/api/v1/messaging/messages/${parent}/reply`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({body:'QA-S2-DELPROP reply', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, parent);
  out.parent=parent; out.reply=reply;
  // ALSO a plain channel message, to compare channel-feed vs thread-panel propagation
  const plain=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-DELPROP plain', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  out.plain=plain;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(8000);
  const snap=()=>page.evaluate(({reply,plain})=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const head=[...document.querySelectorAll('*')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/^Replies \(/.test(t))[0]||null;
    const r=document.querySelector(`[data-message-id="${reply}"]`);
    const p=document.querySelector(`[data-message-id="${plain}"]`);
    return {head,
      replyText:r?(r.innerText||'').replace(/\s+/g,' ').slice(-34):'absent',
      plainText:p?(p.innerText||'').replace(/\s+/g,' ').slice(-34):'absent'};}, {reply,plain});
  out.before=await snap();
  out.del=await page.evaluate(async({ch,reply,plain})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[reply,plain]})});
    return {status:r.status};}, {ch,reply,plain});
  const s=[]; for(let i=0;i<22;i++){ await page.waitForTimeout(1500); s.push(await snap()); }
  out.samples=s.length;
  out.first=s[0]; out.last=s.at(-1);
  out.replyChangedAt=s.findIndex(x=>/deleted/i.test(x.replyText||''));
  out.plainChangedAt=s.findIndex(x=>/deleted/i.test(x.plainText||''));
  out.headChangedAt=s.findIndex(x=>x.head!==out.before.head);
  return out;
};
