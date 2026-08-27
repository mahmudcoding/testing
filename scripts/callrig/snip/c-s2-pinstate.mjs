export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4QCPRIVATE0001', ws='W4QCF1XTURESO01';
  const keys=Object.keys(localStorage).filter(k=>/pin/i.test(k));
  const local=Object.fromEntries(keys.map(k=>[k,String(localStorage.getItem(k)).slice(0,120)]));
  const out={localStorageKeys:local};
  // does the server know?
  const c=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
  let cj=null; try{cj=await c.json()}catch{}
  out.channelObject={status:c.status, keys:cj?Object.keys(cj):null,
    pinFields:cj?Object.keys(cj).filter(k=>/pin/i.test(k)):[]};
  const l=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
  let lj=null; try{lj=await l.json()}catch{}
  const arr=(lj&&(lj.channels||lj.items))||[];
  const hit=(Array.isArray(arr)?arr:[]).find(x=>x.id===ch);
  out.inChannelList={status:l.status, keys:hit?Object.keys(hit):null,
    pinFields:hit?Object.keys(hit).filter(k=>/pin/i.test(k)):[]};
  const p=await fetch(`/api/v1/messaging/channels/${ch}/pin`,{credentials:'include'});
  out.pinEndpointGet=p.status;
  return out;
});
