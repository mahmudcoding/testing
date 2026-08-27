export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
    const j=await r.json();
    return (j.meetings||[]).map(m=>({t:m.title, s:m.starts_at, acc:m.access||m.visibility||m.access_type, parts:(m.participants||[]).length,
      me:(m.participants||[]).filter(p=>/BOB/i.test(p.user_id||'')).map(p=>p.status||p.response)}));
  });
  const notif = await page.evaluate(async () => {
    const r = await fetch('/api/v1/notifications?limit=10',{credentials:'include'});
    const j=await r.json();
    return (j.notifications||j.data||[]).slice(0,8).map(n=>({ty:n.type, ti:(n.title||'').slice(0,50), body:(n.body||n.message||'').slice(0,60), read:n.is_read??n.read}));
  });
  const chips = await page.evaluate(() => [...document.querySelectorAll('button[data-testid="calendar-event-chip"]')].map(c=>c.innerText.replace(/\n/g,' ')));
  return {api, chips, notif};
};
