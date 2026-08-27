export default async ({ page }) => {
  return await page.evaluate(async()=>{
    const who=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null);
    const r=await fetch('/api/v1/calendar/meetings/S4OV0EO12BSAOAQ',{credentials:'include'});
    const txt=await r.text();
    let j=null; try{ j=JSON.parse(txt); }catch(e){}
    return { who:who?.email??who?.data?.email, status:r.status,
             topLevelKeys:Object.keys(j||{}),
             attendeesType: Array.isArray(j?.attendees)?('array len '+j.attendees.length):(j?.attendees===null?'null':typeof j?.attendees),
             attendeesRaw: JSON.stringify(j?.attendees ?? null).slice(0,300),
             participantCount: j?.meeting?.participant_count,
             bodyLen: txt.length };
  });
};
