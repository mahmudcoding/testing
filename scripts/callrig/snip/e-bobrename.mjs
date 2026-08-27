export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
    const j=await r.json(); return (j.meetings||[]).map(m=>m.title);
  });
  const chips = await page.evaluate(()=>[...document.querySelectorAll('button[data-testid="calendar-event-chip"]')].map(c=>c.innerText.replace(/\n/g,' ').slice(0,34)));
  const notif = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications?limit=4',{credentials:'include'});
    const j=await r.json(); return (j.notifications||[]).slice(0,3).map(n=>(n.body||'').slice(0,55));
  });
  return {api, chips, notifTitlesStillOld: notif};
};
