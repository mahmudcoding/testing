export default async ({page}) => {
  const ch='C4QCPRIVATE0001';
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=50`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    const junk=a.filter(m=>/QARES|QAHINT|QACMD|QAEC\d|QAEDITLONG|QALONG|QAPROSE|QAEMPTY|QA\\?-BOUND/.test(m.body||''));
    const ids=junk.map(m=>m.id);
    if(!ids.length) return {found:0};
    const d=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',
      credentials:'include',headers:{'content-type':'application/json'},
      body:JSON.stringify({message_ids:ids})});
    const after=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=50`,{credentials:'include'})).json();
    const aa=after.messages||after.data||[];
    return {found:ids.length, status:d.status,
      remaining:aa.filter(m=>/QARES|QAHINT|QACMD|QAEC\d|QAEDITLONG|QALONG|QAPROSE/.test(m.body||'')).length};
  }, ch);
};
