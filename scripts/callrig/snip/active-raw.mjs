export default async ({page}) => await page.evaluate(async()=>{
  const r = await fetch('/api/v1/workspace/W4QAF1XTURESO01/meetings/active',{credentials:'include'});
  const j = await r.json();
  return (j.meetings||[]).map(m=>({id:m.id, name:m.name, channel_id:m.channel_id, status:m.status,
    participant_count:m.participant_count, top:(m.top_participants||[]).map(p=>p.name)}));
});
