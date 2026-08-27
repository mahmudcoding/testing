import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(`(async () => {
    const u='/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-23T19:00:00.000Z&to=2026-08-30T19:00:00.000Z';
    const r=await fetch(u,{credentials:'include'}); const t=await r.text();
    let d=null; try{d=JSON.parse(t);}catch(e){return {st:r.status, raw:t.slice(0,200)};}
    const a=d.meetings||[];
    const me=(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json());
    const myId=me.id||me.user_id||me.user?.id;
    return { st:r.status, myId:myId? myId.slice(-7):null, n:a.length,
      mine:a.filter(m=>m.created_by===myId).length,
      private:a.filter(m=>m.is_private===true).length,
      privateTitles:a.filter(m=>m.is_private===true).map(m=>(m.title||'').slice(0,30)).slice(0,6),
      keys:Object.keys(a[0]||{}).join(',').slice(0,220),
      sampleOthers:a.filter(m=>m.created_by!==myId).slice(0,4)
        .map(m=>({t:(m.title||'').slice(0,28), priv:m.is_private, by:(m.created_by||'').slice(-6),
                  att:Array.isArray(m.attendees)?m.attendees.length:'(no attendees field)'})) }; })()`);
};
