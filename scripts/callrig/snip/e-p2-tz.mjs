import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
    const now=new Date();
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const j=await r.json(); const u=j.user||j;
    const m=(document.querySelector('main').innerText||'').replace(/\\s+/g,' ');
    return {
      browserTZ: Intl.DateTimeFormat().resolvedOptions().timeZone,
      browserOffsetMinutes: -now.getTimezoneOffset(),
      browserLocalString: now.toString().slice(0,33),
      browserISO: now.toISOString(),
      localDate: now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0'),
      accountTimezone: u.timezone||u.time_zone||'(absent)',
      calendarHeader: (m.match(/CALENDAR[^|]{0,60}/)||[''])[0].trim(),
      gmtLabel: (m.match(/GMT[+-]\\d{2}:\\d{2}/)||[''])[0],
      dayHeading: (m.match(/(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\\s+\\d{1,2}\\s+\\w+\\s+\\d{4}/)||[''])[0]
    }; })()`);
};
