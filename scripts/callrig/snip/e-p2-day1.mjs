import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const reqs=[]; const h=r=>{const u=r.url(); if(/\/api\/v1\/calendar|meetings/.test(u)&&/from=|to=/.test(u))
    reqs.push(u.replace(/https?:\/\/[^/]+/,'').replace(/(company_id|workspace_id)=[^&]*/g,'$1=<x>').slice(0,150));};
  page.on('request',h);
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  // switch to Day
  await page.locator('main button').filter({hasText:/^Day$/}).first().click();
  await page.waitForTimeout(4000);
  page.off('request',h);
  return await page.evaluate((reqs)=>{
    const now=new Date();
    const m=document.querySelector('main')||document.body;
    const t=m.innerText.replace(/\s+/g,' ');
    return {
      browserLocalDate: now.toLocaleDateString('en-CA'),
      browserUTCDate: now.toISOString().slice(0,10),
      browserTZ: Intl.DateTimeFormat().resolvedOptions().timeZone,
      heading: (t.match(/(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s+\d{1,2}\s+\w+\s+\d{4}/i)||[''])[0],
      headStart: t.slice(0,140),
      requests: reqs
    };
  }, reqs);
};
