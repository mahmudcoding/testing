export default async ({page}) => {
  const r = await page.evaluate(async () => {
    const now = Date.now();
    const starts = new Date(now + 3*3600*1000).toISOString();
    const ends = new Date(now + 3.5*3600*1000).toISOString();
    const res = await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({workspace_id:"W4QAF1XTURESO01",title:"QA Window Probe",starts_at:starts,ends_at:ends,timezone:"Asia/Tashkent",
        attendee_user_ids:["U4QABOB00000001"],guest_invites:[{email:"external.person@example.com"}],requires_approval:false,is_private:false})});
    const t = await res.text();
    let m=null; try{m=JSON.parse(t).meeting||JSON.parse(t);}catch(e){}
    return {status:res.status, id:m&&m.id, starts, ends, avail: m&&m.live_meeting_available_from, guestUrl: m&&m.guest_join_url, raw:t.slice(0,400)};
  });
  if (!r.id) return r;
  const start = await page.evaluate(async (id) => {
    const res = await fetch('/api/v1/calendar/meetings/'+id+'/start',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});
    return res.status+' :: '+(await res.text()).slice(0,250);
  }, r.id);
  return {created: r, startEarly: start};
};
