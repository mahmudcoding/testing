import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-20T00:00:00.000Z&to=2026-09-20T00:00:00.000Z',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.meetings||[];
    return a.filter(m=>/date-follow|AllDay/i.test(m.title))
      .map(m=>m.title+' :: starts '+m.starts_at+'  ends '+m.ends_at+'  allday='+(m.is_all_day??m.all_day??'-')); })()`);
};
