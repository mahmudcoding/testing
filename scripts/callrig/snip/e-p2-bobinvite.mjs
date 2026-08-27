import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const tag = process.env.QA_TAG || 'x';
  return await page.evaluate(`(async () => {
    const start=new Date(Date.now()+3*3600*1000).toISOString();
    const end=new Date(Date.now()+3.5*3600*1000).toISOString();
    const r=await fetch('/api/v1/calendar/meetings',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({workspace_id:'${WS}', title:'Invite seam ${tag}',
        starts_at:start, ends_at:end, timezone:'Asia/Tashkent',
        attendee_user_ids:['U4QEALICE000001'], guest_invites:[],
        requires_approval:false, is_private:false, mute_on_join:false})});
    let j=null; try{j=await r.json();}catch(e){}
    return {st:r.status, id:(j&&(j.id||(j.meeting&&j.meeting.id)))||null,
            title:(j&&(j.title||(j.meeting&&j.meeting.title)))||null}; })()`);
};
