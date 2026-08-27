import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => await page.evaluate(async ({WS}) => {
  const s=new Date(Date.now()+3*3600e3), e=new Date(Date.now()+4*3600e3);
  const body={workspace_id:WS, title:'QA-E liveprobe meeting',
    starts_at:s.toISOString(), ends_at:e.toISOString(),
    timezone:'Asia/Tashkent', attendee_user_ids:['U4QEBOB00000001']};
  const r=await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
  const t=await r.text();
  return {status:r.status, body:t.slice(0,220)};
}, {WS});
