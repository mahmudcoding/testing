export default async ({page}) => {
  const ch='C4QCPRIVATE0001';
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=30`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    const hits=a.filter(m=>/QA\\?-BOUND\\?-x/.test(m.body||''));
    return {total:a.length, matches:hits.length,
      lens:hits.map(m=>(m.body||'').length),
      heads:hits.map(m=>(m.body||'').slice(0,16)),
      tails:hits.map(m=>(m.body||'').slice(-10)),
      seqs:hits.map(m=>m.channel_seq)};
  }, ch);
};
