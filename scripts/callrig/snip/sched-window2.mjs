export default async ({page}) => {
  const r = await page.evaluate(async () => {
    const now = Date.now();
    const starts = new Date(now + 3*3600*1000).toISOString();
    const ends = new Date(now + 3.5*3600*1000).toISOString();
    const res = await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({workspace_id:"W4QAF1XTURESO01",title:"QA Window Probe",starts_at:starts,ends_at:ends,timezone:"Asia/Tashkent",
        attendee_user_ids:["U4QABOB00000001"],guest_invites:[{guest_email:"external.person@example.com",guest_name:"External Person"}],requires_approval:false,is_private:false})});
    const t = await res.text();
    let m=null; try{const j=JSON.parse(t); m=j.meeting||j;}catch(e){}
    return {status:res.status, id:m&&m.id, starts, avail: m&&m.live_meeting_available_from, guestUrl: m&&m.guest_join_url, raw:t.slice(0,300)};
  });
  if (!r.id) return r;
  const probes = await page.evaluate(async (id) => {
    const p = async (path, method, body) => { const res = await fetch(path,{method:method||'GET',credentials:'include',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined}); return res.status+' :: '+(await res.text()).slice(0,200); };
    return {
      start: await p('/api/v1/calendar/meetings/'+id+'/start','POST',{}),
      detail: await p('/api/v1/calendar/meetings/'+id)
    };
  }, r.id);
  return {created: r, probes};
};
