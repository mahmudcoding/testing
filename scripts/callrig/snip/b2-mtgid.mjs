export default async ({page}) => await page.evaluate(async(ws)=>{
  const r=await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'});
  const j=await r.json();
  return (j.meetings||[]).map(m=>({id:m.id, name:m.name, ch:m.channel_id, n:m.participant_count}));
}, 'W4QBF1XTURESO01');
