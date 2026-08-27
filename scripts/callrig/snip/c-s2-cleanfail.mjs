export default async ({page}) => {
  const ch='C4QCPRIVATE0001';
  return page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=40`,{credentials:'include'})).json();
    const ids=(j.messages||j.data||j||[]).filter(m=>/QA\\?-S2\\?-FAIL/.test(m.body||'')).map(m=>m.id);
    if(!ids.length) return {found:0};
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:ids})});
    return {found:ids.length, status:r.status};
  }, ch);
};
