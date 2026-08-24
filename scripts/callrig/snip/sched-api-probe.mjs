export default async ({page}) => {
  const base = {workspace_id:"W4QAF1XTURESO01",title:"QA Probe",starts_at:"2026-08-25T09:30:00.000Z",ends_at:"2026-08-25T10:00:00.000Z",timezone:"Asia/Tashkent",meeting_url:"",location:"",attendee_user_ids:[],guest_invites:[],requires_approval:true,is_private:false,mute_on_join:false,who_can_open_rooms:"host_only",max_rooms:8};
  const cases = [
    ['no-recurrence', {}],
    ['weekly', {recurrence:{frequency:"weekly",interval_count:1,days_of_week:[1]}}],
    ['daily', {recurrence:{frequency:"daily",interval_count:1}}],
    ['monthly', {recurrence:{frequency:"monthly",interval_count:1}}],
    ['weekly-no-days', {recurrence:{frequency:"weekly",interval_count:1}}],
    ['weekly-with-attendees', {recurrence:{frequency:"weekly",interval_count:1,days_of_week:[1]}, attendee_user_ids:["U4QABOB00000001"]}]
  ];
  const out=[];
  for (const [k, extra] of cases) {
    const body = Object.assign({}, base, extra, {title:'QA Probe '+k});
    const r = await page.evaluate(async (b) => {
      const res = await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      const t = await res.text();
      let id=null; try { id = JSON.parse(t).meeting?.id || JSON.parse(t).id; } catch(e){}
      return {status:res.status, id, body:t.slice(0,220)};
    }, body);
    out.push({k, ...r});
  }
  return out;
};
