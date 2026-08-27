import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => await page.evaluate(async ({WS}) => {
  const s=new Date(Date.now()+7*3600e3), e=new Date(Date.now()+8*3600e3);
  const r=await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({workspace_id:WS, title:'QA-E late2 meeting',
      starts_at:s.toISOString(), ends_at:e.toISOString(), timezone:'Asia/Tashkent',
      attendee_user_ids:['U4QEBOB00000001']})});
  return {status:r.status, at:new Date().toISOString().slice(11,19)};
}, {WS});
