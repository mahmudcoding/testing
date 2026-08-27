export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const ids=await page.evaluate(async (ch)=>{
    const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-DELREPLY parent'})});
    const pj=await p.json(); const pid=pj.id||pj.message?.id;
    await new Promise(r=>setTimeout(r,1500));
    const rp=await fetch(`/api/v1/messaging/messages/${pid}/reply`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-DELREPLY the reply'})});
    const rj=await rp.json();
    return {parent:pid, reply:rj.id||rj.message?.id};}, ch);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${ids.parent}`);
  await page.waitForTimeout(13000);
  const st=()=>page.evaluate((rid)=>{
    const el=document.querySelector(`[data-message-id="${rid}"]`);
    const body=document.body.innerText||'';
    const m=body.match(/(\d+)\s+repl/i);
    return {replyNode:!!el, replyText:el?(el.innerText||'').replace(/\s+/g,' ').trim().slice(-34):null,
      counter:m?m[0]:'none'};}, ids.reply);
  const out={setup:ids.reply.slice(-5), before:await st()};
  // delete the reply
  out.delete=await page.evaluate(async ({ch,rid})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({message_ids:[rid]})});
    const j=await r.json(); return {status:r.status, ids:j&&j.deleted_ids};},{ch,rid:ids.reply});
  // poll the open panel
  const seen=[];
  for(let i=0;i<22;i++){ seen.push(await st()); await page.waitForTimeout(1500); }
  out.pollsAfterDelete=seen.length;
  out.distinctStates=[...new Set(seen.map(s=>`node=${s.replyNode}|text=${s.replyText}|${s.counter}`))].slice(0,4);
  await page.reload(); await page.waitForTimeout(11000);
  out.afterReload=await st();
  return out;
};
