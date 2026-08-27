export default async ({page}) => {
  const ch='C4QCPRIVATE0001';
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=14`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    return a.map(m=>({seq:m.channel_seq, len:(m.body||'').length,
      head:(m.body||'').slice(0,14), tail:(m.body||'').slice(-6)}));
  }, ch);
};
