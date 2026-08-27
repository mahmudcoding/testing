export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  const parent=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-V13PARENT', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  const reply=await page.evaluate(async(parent)=>{
    const r=await fetch(`/api/v1/messaging/messages/${parent}/reply`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({body:'QA-S2-V13REPLY', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, parent);
  out.parent=parent; out.reply=reply;
  // delete the parent
  out.del = await page.evaluate(async({ch,parent})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[parent]})});
    return {status:r.status};}, {ch,parent});
  // does the reply survive on the server?
  out.replyOnServer = await page.evaluate(async({ch,reply})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=40`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===reply);
    return m? 'present in channel list':'absent from channel list';}, {ch,reply});
  out.threadApi = await page.evaluate(async(parent)=>{
    const r=await fetch(`/api/v1/messaging/messages/${parent}/thread?limit=20`,{credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,140)};}, parent);
  // open the thread panel by URL and watch
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(7000);
  out.panel = await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const right=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
      .filter(e=>e.getBoundingClientRect().x>900).map(e=>(e.textContent||'').trim()).filter(Boolean);
    return {texts:[...new Set(right)].slice(0,14),
      buttons:[...document.querySelectorAll('button')].filter(vis)
        .filter(b=>b.getBoundingClientRect().x>900)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,20)).slice(0,10)};
  });
  return out;
};
