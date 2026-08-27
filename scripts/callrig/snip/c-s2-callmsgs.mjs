export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(7000);
  return page.evaluate(async(dm)=>{
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=8`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.messages||[]).filter(m=>m.call_outcome||m.meeting_id)
      .map(m=>({outcome:m.call_outcome, seconds:m.call_duration_seconds,
        created_at:m.created_at, meeting:m.meeting_id, seq:m.channel_seq}));}, dm);
};
