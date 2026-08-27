export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00Z&to=2026-08-29T00:00:00Z',{credentials:'include'});
    const d=await r.json(); const m=(d.meetings||[]).find(x=>x.id==='S4OWSESS9KOG8BT');
    return m? {visible:true, my_status:m.my_status, title:(m.title||'').slice(0,40)} : {visible:false}; })()`);
};
