export default async ({page}) => {
  const ch='C4QCPRIVATE0001';
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=40`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    const junk=a.filter(m=>{
      const b=m.body||'';
      return b.length>3000 || /^(z{5,}|w{5,}|x{5,})$/.test(b)
             || /QALONG|QAPROSE|QAEMPTY|QA\\?-BOUND/.test(b);
    });
    const ids=junk.map(m=>m.id);
    if(!ids.length) return {found:0};
    const d=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',
      credentials:'include',headers:{'content-type':'application/json'},
      body:JSON.stringify({message_ids:ids})});
    const after=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=40`,{credentials:'include'})).json();
    const aa=after.messages||after.data||[];
    return {found:ids.length, deleteStatus:d.status,
      remainingLong:aa.filter(m=>(m.body||'').length>3000).length};
  }, ch);
};
