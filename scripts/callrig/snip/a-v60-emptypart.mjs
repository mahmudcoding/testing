export default async ({ page }) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01&from=2026-08-23T19%3A00%3A00.000Z&to=2026-08-31T19%3A00%3A00.000Z',{credentials:'include'});
    const j=await r.json().catch(()=>null); const arr=j?.meetings||[];
    const out=[];
    for(const m of arr.filter(x=>/V60/.test(x.title||''))){
      const d=await fetch('/api/v1/calendar/meetings/'+m.id,{credentials:'include'});
      const dj=await d.json().catch(()=>null);
      out.push({ title:(m.title||'').slice(0,26),
        topKeys:Object.keys(dj||{}),
        attendees: Array.isArray(dj?.attendees)? dj.attendees.length : '(key absent)',
        count: dj?.meeting?.participant_count });
    }
    return out;
  });
};
