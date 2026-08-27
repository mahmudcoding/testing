export default async ({page}) => await page.evaluate(async(env)=>{
  const start = new Date(Date.now()+env.s*60000).toISOString();
  const end   = new Date(Date.now()+env.e*60000).toISOString();
  const body = {title: env.title, workspace_id:'W4QBF1XTURESO01',
    starts_at:start, ends_at:end, timezone:'Asia/Tashkent', is_private:false,
    requires_approval:false, attendee_user_ids:['U4QBBOB00000001']};
  const r = await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',
    headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
  const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch(e){}
  const m=(j&&(j.meeting||j))||{};
  return {status:r.status, id:m.id, starts_at:m.starts_at, ends_at:m.ends_at, st:m.status};
}, {s:Number(process.env.QA_S||2), e:Number(process.env.QA_E||4), title:process.env.QA_TITLE||'QA never started'});
