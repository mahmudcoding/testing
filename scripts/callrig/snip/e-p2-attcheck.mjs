export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/calendar/meetings/S4OWSESS9KOG8BT',{credentials:'include'});
    const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){return {raw:t.slice(0,120)};}
    const a=d.attendees||[];
    return {count:a.length, users:a.map(x=>(x.user_id||'').slice(-8)+':'+(x.status||'?')),
            starts:(d.meeting||{}).starts_at, ends:(d.meeting||{}).ends_at}; })()`);
};
