export default async ({page}) => page.evaluate(async ()=>{
  const out={};
  for (const [n,ch] of [['qa-general','C4QCGENERAL0001'],['qa-private','C4QCPRIVATE0001']]) {
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    let b=null; try{b=await r.json()}catch{}
    out[n]={status:r.status,total:b&&b.total,count:b&&b.messages&&b.messages.length};
  }
  return out;
});
