import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const MID='S4OWKW57UWOK0WU';
export default async ({page}) => {
  const out={}; const seen=[];
  page.on('response', async r => { const u=r.url();
    if (/\/api\/v1\/calendar\/(meetings|events)/.test(u) && r.request().method()==='GET') {
      let b=''; try{ b=await r.text(); }catch(e){}
      seen.push({u:u.replace(/^https:\/\/[^/]+/,'').slice(0,110), s:r.status(), len:b.length, body:b}); } });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const grid = seen.filter(x=>!x.u.includes(MID));
  out.gridRequests = grid.map(x=>x.u+' -> '+x.s+' ('+x.len+'B)');
  out.gridEventForOurMeeting = (() => {
    for (const g of grid) { try { const j=JSON.parse(g.body);
      const arr = j.events||j.meetings||j.data||[];
      const list = Array.isArray(arr)? arr : [];
      const m = list.find(e=>e.id===MID);
      if (m) return {keys:Object.keys(m).join(','), my_status:m.my_status, attendees: m.attendees? 'len '+m.attendees.length : 'ABSENT',
        attendeeSample: m.attendees? JSON.stringify(m.attendees[0]||{}).slice(0,170):null, scheduled_status:m.scheduled_status};
    } catch(e){} }
    return 'not found in any list payload'; })();
  seen.length=0;
  await page.goto(BASE+'/w/'+WS+'/calendar/'+MID, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.deepLinkRequests = seen.map(x=>x.u+' -> '+x.s+' ('+x.len+'B)');
  out.deepLinkBody = (() => { const d=seen.find(x=>x.u.includes(MID));
    if(!d) return 'no by-id request seen';
    try { const j=JSON.parse(d.body); const m=j.meeting||j.event||j.data||j;
      return {keys:Object.keys(m).join(','), my_status:m.my_status, attendees: m.attendees? 'len '+m.attendees.length:'ABSENT',
        participants: m.participants? 'len '+m.participants.length:'ABSENT', participant_count:m.participant_count, scheduled_status:m.scheduled_status};
    } catch(e){ return 'parse fail: '+d.body.slice(0,150); } })();
  return out;
};
