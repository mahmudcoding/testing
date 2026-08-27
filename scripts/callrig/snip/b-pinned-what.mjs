export default async ({page}) => {
  const id='C4QBPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const msgs = await page.evaluate(async(id)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${id}/messages?limit=20`,{credentials:'include'})).json();
    return (j?.data?.messages||j?.messages||[]).map(m=>({id:m.id, body:(m.body||'').slice(0,44),
      hasAttach:!!(m.attachments||m.files||[]).length, fwd:!!(m.forwarded_from||m.forward||m.snapshot||null),
      del:!!m.deleted_at, pinned:!!m.pinned, keys:Object.keys(m).filter(k=>/forward|snap|attach|file/i.test(k))}));
  }, id);
  const pinned = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/messaging/channels/${id}/messages/pinned`,{credentials:'include'});
    const t=await r.text(); return t.slice(0,500);
  }, id);
  const banner = await page.evaluate(()=>{
    const el=document.querySelector('[data-testid="pinned-messages-transition"]');
    return el?{phase:el.dataset?.phase, text:(el.innerText||'').replace(/\s+/g,' ').slice(0,90)}:null;});
  return {msgs, pinned, banner};
};
