export default async ({page}) => await page.evaluate(async () => {
  const now = Date.now();
  const r = await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({workspace_id:"W4QAF1XTURESO01", title:"QA Guest Link Recheck",
      starts_at:new Date(now+3*3600*1000).toISOString(), ends_at:new Date(now+3.5*3600*1000).toISOString(),
      timezone:"Asia/Tashkent", attendee_user_ids:[],
      guest_invites:[{guest_email:"recheck@example.com",guest_name:"Recheck Guest"}],
      requires_approval:false, is_private:false})});
  const t=await r.text(); let m=null; try{m=JSON.parse(t).meeting||JSON.parse(t);}catch(e){}
  return {status:r.status, id:m&&m.id, starts:m&&m.starts_at, guestUrl:m&&m.guest_join_url};
});
