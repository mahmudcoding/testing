import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page, ctx}) => {
  const zones = ['America/New_York','America/Los_Angeles','Etc/GMT+12','Asia/Tashkent'];
  const cdp = await page.context().newCDPSession(page);
  const out=[];
  for (const tz of zones) {
    await cdp.send('Emulation.setTimezoneOverride', {timezoneId: tz});
    const reqs=[]; const h=r=>{const u=r.url(); if(/\/calendar\/meetings\?/.test(u)&&/from=/.test(u))
      reqs.push(decodeURIComponent(u).replace(/https?:\/\/[^/]+/,'').replace(/workspace_id=[^&]*/,'workspace_id=<WS>'));};
    page.on('request',h);
    await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    await page.locator('main button').filter({hasText:/^Day$/}).first().click();
    await page.waitForTimeout(4000);
    page.off('request',h);
    const r = await page.evaluate(()=>{
      const now=new Date(); const m=document.querySelector('main')||document.body;
      const t=m.innerText.replace(/\s+/g,' ');
      return {localDate:now.toLocaleDateString('en-CA'), utcDate:now.toISOString().slice(0,10),
        tz:Intl.DateTimeFormat().resolvedOptions().timeZone,
        heading:(t.match(/(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s+\d{1,2}\s+\w+\s+\d{4}/i)||[''])[0]};
    });
    const shownDay = (r.heading.match(/\s(\d{1,2})\s/)||[])[1] || '?';
    const localDay = r.localDate.slice(8);
    out.push({tz, localDate:r.localDate, utcDate:r.utcDate, heading:r.heading,
      matchesLocal: String(Number(shownDay))===String(Number(localDay)),
      matchesUTC: String(Number(shownDay))===String(Number(r.utcDate.slice(8))),
      request: reqs[reqs.length-1]||null});
  }
  await cdp.send('Emulation.setTimezoneOverride', {timezoneId: ''});
  return out;
};
