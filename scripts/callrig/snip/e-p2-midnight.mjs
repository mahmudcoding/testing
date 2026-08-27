import {WS, BASE} from './e-p2-helpers.mjs';
async function readDay(page, label){
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
      heading:(t.match(/(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s+\d{1,2}\s+\w+\s+\d{4}/i)||[''])[0],
      summary:(t.match(/meetings \d+ h [\d.]+/)||[''])[0]};
  });
  const shown=(r.heading.match(/\s(\d{1,2})\s/)||[])[1];
  return {label, ...r, request:reqs[reqs.length-1]||null,
    matchesLocalDate: Number(shown)===Number(r.localDate.slice(8)),
    matchesUTCDate:   Number(shown)===Number(r.utcDate.slice(8))};
}
export default async ({page}) => {
  const out={};
  // 1) SELF-HEAL: real clock, no override at all
  out.selfHeal_noOverride = await readDay(page,'real zone, no override');
  // 2) MIRROR IMAGE: zones west of UTC, where local date is now BEHIND UTC
  const cdp = await page.context().newCDPSession(page);
  out.mirror=[];
  for (const tz of ['America/New_York','America/Los_Angeles','Etc/GMT+12']) {
    await cdp.send('Emulation.setTimezoneOverride', {timezoneId: tz});
    out.mirror.push(await readDay(page, tz));
  }
  await cdp.send('Emulation.setTimezoneOverride', {timezoneId: ''});
  out.after_override_cleared = await readDay(page,'override cleared');
  return out;
};
