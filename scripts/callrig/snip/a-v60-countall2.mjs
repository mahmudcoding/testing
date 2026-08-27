export default async ({ page }) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01&from=2026-08-23T19%3A00%3A00.000Z',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const arr=j?.meetings||j?.data||(Array.isArray(j)?j:[]);
    const out=[];
    for(const m of (arr||[]).slice(0,10)){
      const d=await fetch('/api/v1/calendar/meetings/'+m.id,{credentials:'include'});
      const dj=await d.json().catch(()=>null);
      out.push({ title:(m.title||'').slice(0,24), listCount:m.participant_count, detailCount:dj?.meeting?.participant_count,
                 attendees:Array.isArray(dj?.attendees)?dj.attendees.length:'(absent)',
                 statuses:(dj?.attendees||[]).map(a=>a.status).join(',')||'-' });
    }
    return { n:(arr||[]).length, keys:Object.keys(j||{}), rows:out };
  });
};
