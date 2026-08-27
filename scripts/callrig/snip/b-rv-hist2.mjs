export default async ({page}) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/meetings/history?limit=100',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const arr=(j&&(j.meetings||j.items||j.data))||[];
    const withEnd=arr.filter(m=>'end_reason' in m).map(m=>({name:m.name, end:m.end_reason, ch:m.channel_id||'', by:m.creator_name}));
    // как клиент отличает 1-to-1: посмотрим на записи БЕЗ end_reason и с ним
    const noEnd=arr.filter(m=>!('end_reason' in m)).slice(0,6).map(m=>({name:m.name, ch:m.channel_id||'', by:m.creator_name}));
    return {total:arr.length, withEndReason:withEnd.length, withEnd, noEndSample:noEnd};
  });
};
