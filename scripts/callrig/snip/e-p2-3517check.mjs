import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-09-20T00:00:00Z&to=2026-09-30T00:00:00Z',{credentials:'include'});
    const d=await r.json(); const m=(d.meetings||[]).find(x=>/blocked invite probe/i.test(x.title||''));
    if(!m) return {created:false, titles:(d.meetings||[]).map(x=>(x.title||'').slice(0,28)).slice(0,8)};
    const b=await fetch('/api/v1/calendar/meetings/'+m.id,{credentials:'include'});
    const t=await b.text(); let j=null; try{j=JSON.parse(t);}catch(e){}
    const att=(j&&j.attendees)||[];
    return {created:true, id:m.id.slice(-6), title:m.title,
            attendeeCount:att.length,
            attendees:att.map(a=>(a.user_id||'').slice(-8)+':'+(a.status||'?'))}; })()`);
};
