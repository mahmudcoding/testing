import {WS, BASE} from './e-p2-helpers.mjs';
const MID='S4OWSESS9KOG8BT';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  return await page.evaluate(`(async () => {
    const out={};
    const read = async () => {
      const l=await (await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-26T00:00:00Z&to=2026-08-29T00:00:00Z',{credentials:'include'})).json();
      const row=(l.meetings||[]).find(m=>m.id==='${MID}')||{};
      const b=await (await fetch('/api/v1/calendar/meetings/${MID}',{credentials:'include'})).json();
      const m=b.meeting||b;
      const pick=o=>({requires_approval:o.requires_approval, mute_on_join:o.mute_on_join,
                      who_can_open_rooms:o.who_can_open_rooms, max_rooms:o.max_rooms,
                      is_private:o.is_private, has_password:o.has_password});
      return {list:pick(row), byId:pick(m)};
    };
    out.before = await read();
    const p=await fetch('/api/v1/calendar/meetings/${MID}',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({mute_on_join:true, requires_approval:false, max_rooms:4})});
    out.patch={st:p.status, body:(await p.text()).slice(0,90)};
    await new Promise(r=>setTimeout(r,2500));
    out.after = await read();
    // restore
    const q=await fetch('/api/v1/calendar/meetings/${MID}',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({mute_on_join:false, requires_approval:true, max_rooms:8})});
    out.restore={st:q.status};
    return out; })()`);
};
