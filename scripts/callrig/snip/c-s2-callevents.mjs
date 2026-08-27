export default async ({page}) => page.evaluate(async()=>{
  const ws='W4QCF1XTURESO01';
  const chans=await (await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'})).json();
  const arr=chans.channels||chans.data||chans||[];
  const out=[];
  for (const c of arr.slice(0,8)){
    try{
      const j=await (await fetch(`/api/v1/messaging/channels/${c.id}/messages?limit=100`,{credentials:'include'})).json();
      const ms=j.messages||j.data||j||[];
      const calls=ms.filter(m=>m.call_event||m.meeting_id||m.call_outcome);
      out.push({name:c.name, total:ms.length, calls:calls.length,
        sample: calls.slice(0,2).map(m=>({outcome:m.call_outcome||(m.call_event&&m.call_event.outcome),
          dur:m.call_duration_seconds}))});
    }catch(e){ out.push({name:c.name, err:String(e).slice(0,40)}); }
  }
  return out;
});
