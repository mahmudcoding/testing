export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  return await page.evaluate(async()=>{
    const who=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch('/api/v1/calendar/meetings/S4OWB577EO9O4DE',{credentials:'include'});
    const j=await r.json(); const m=j.meeting||j;
    return {as:who.email||who.data?.email, status:r.status,
      ALL_KEYS:Object.keys(m).join(','),
      attendees: m.attendees===undefined?'ABSENT':JSON.stringify(m.attendees).slice(0,200),
      participants: m.participants===undefined?'ABSENT':JSON.stringify(m.participants).slice(0,120)};
  });
};
