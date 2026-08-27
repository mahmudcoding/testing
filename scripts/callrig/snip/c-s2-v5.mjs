export default async ({page}) => {
  const dm='C4OVEWOTJW1AA86';
  return page.evaluate(async(dm)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=40`,{credentials:'include'})).json();
    const ms=j.messages||j.data||j||[];
    const calls=ms.filter(m=>m.call_duration_seconds!=null||m.call_outcome||m.meeting_id);
    return calls.map(m=>{
      const created=m.created_at;
      const dur=m.call_duration_seconds;
      const started= (created&&dur!=null)? new Date(new Date(created).getTime()-dur*1000).toISOString():null;
      return {id:m.id, created_at:created, call_duration_seconds:dur,
        outcome:m.call_outcome||(m.call_event&&m.call_event.outcome),
        derivedStart:started, body:(m.body||'').slice(0,20),
        keys:Object.keys(m).filter(k=>/call|meeting/i.test(k))};
    });
  }, dm);
};
