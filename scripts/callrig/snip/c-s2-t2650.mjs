export default async ({page}) => {
  const ws='W4QCF1XTURESO01', a='C4QCPRIVATE0001', b='C4OWNFC5WK5M1D6';
  const out={};
  const order=()=>page.evaluate(()=>[...document.querySelectorAll('a[href*="/c/"]')]
    .filter(x=>x.getBoundingClientRect().height>0)
    .map(x=>({t:(x.innerText||'').replace(/\s+/g,' ').slice(0,22),
      y:Math.round(x.getBoundingClientRect().y)})));
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${a}`);
  await page.waitForTimeout(7500);
  out.orderStart=await order();
  // send to B so it should rise
  out.sentB=await page.evaluate(async(b)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:b, body:'QA-S2-T2650 last', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    const j=await r.json(); return {status:r.status, id:j.id};}, b);
  await page.waitForTimeout(4000);
  out.orderAfterSend=await order();
  // delete that message
  out.del=await page.evaluate(async({b,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${b}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[id]})});
    return {status:r.status};}, {b,id:out.sentB.id});
  await page.waitForTimeout(4500);
  out.orderAfterDeleteLive=await order();
  await page.reload(); await page.waitForTimeout(7500);
  out.orderAfterReload=await order();
  return out;
};
