export default async ({page}) => {
  const me = await page.evaluate(async()=> (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email);
  const base = {workspace_id:"W4QAF1XTURESO01",title:"QA Recur Probe",starts_at:"2026-08-26T09:30:00.000Z",ends_at:"2026-08-26T10:00:00.000Z",timezone:"Asia/Tashkent",attendee_user_ids:[],guest_invites:[],requires_approval:true,is_private:false};
  const r = await page.evaluate(async (b) => {
    const p = async body => { const res = await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const t=await res.text(); let id=null; try{id=JSON.parse(t).meeting?.id;}catch(e){} return {s:res.status, id, t:t.slice(0,160)}; };
    return {plain: await p(Object.assign({},b,{title:b.title+' plain'})),
            weekly: await p(Object.assign({},b,{title:b.title+' weekly', recurrence:{frequency:'weekly',interval_count:1,days_of_week:[2]}}))};
  }, base);
  return {me, ...r};
};
