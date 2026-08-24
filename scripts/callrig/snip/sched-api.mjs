export default async ({page}) => await page.evaluate(async()=>{
  const start = new Date(Date.now()+5*60000).toISOString();
  const end   = new Date(Date.now()+35*60000).toISOString();
  const r = await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({title:'QA Guest Link Probe', workspace_id:'W4QAF1XTURESO01',
      starts_at:start, ends_at:end, timezone:'Asia/Tashkent', is_private:false, requires_approval:false})});
  const j = await r.json();
  const m = j.meeting||j;
  return {status:r.status, id:m.id, guest_join_url:m.guest_join_url, requires_approval:m.requires_approval};
});
