import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const api = await page.evaluate(`(async () => {
    const u='/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-23T19:00:00.000Z&to=2026-08-30T19:00:00.000Z';
    const r=await fetch(u,{credentials:'include'}); const d=await r.json(); const a=d.meetings||[];
    const p=a.filter(m=>m.is_private===true);
    return { total:a.length, privateCount:p.length,
             privateRows:p.map(m=>({title:m.title, my_status:m.my_status, participants:m.participant_count})) }; })()`);
  const ui = await page.evaluate(`(() => {
    const chips=[...document.querySelectorAll('[data-testid="calendar-event-chip"]')]
      .map(c=>(c.innerText||'').replace(/\\s+/g,' ').trim());
    return { chipCount:chips.length, matching:chips.filter(c=>/RESCHEDULED/i.test(c)).slice(0,2) }; })()`);
  return {api, ui};
};
