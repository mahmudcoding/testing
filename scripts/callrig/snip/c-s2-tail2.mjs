export default async ({page}) => {
  const ch='C4QCPRIVATE0001';
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    return a.map(m=>`${m.channel_seq}  len=${(m.body||'').length}  ${JSON.stringify((m.body||'').slice(0,12))}`);
  }, ch);
};
