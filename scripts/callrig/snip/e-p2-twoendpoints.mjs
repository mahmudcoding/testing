import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(`(async () => {
    const ID='S4OWSESS9KOG8BT';
    const list=await (await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-23T19:00:00.000Z&to=2026-08-30T19:00:00.000Z',{credentials:'include'})).json();
    const row=(list.meetings||[]).find(m=>m.id===ID)||{};
    const r2=await fetch('/api/v1/calendar/meetings/'+ID,{credentials:'include'});
    const t2=await r2.text(); let d2=null; try{d2=JSON.parse(t2);}catch(e){}
    const m2=d2? (d2.meeting||d2):{};
    return {
      list:{ hasMyStatus:'my_status' in row, my_status:row.my_status,
             participant_count:row.participant_count, hasAttendees:'attendees' in row },
      byId:{ status:r2.status, bytes:t2.length, topKeys:d2?Object.keys(d2).join(','):null,
             hasMyStatus:'my_status' in m2, my_status:m2.my_status,
             participant_count:m2.participant_count, hasAttendees:!!(d2&&d2.attendees) } }; })()`);
};
