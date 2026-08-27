import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const seen=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/calendar/.test(u)&&r.request().method()==='GET')
    seen.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,150)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const probe = await page.evaluate(`(async () => {
     const urls=${JSON.stringify([
       `/api/v1/calendar/meetings?workspace_id=${'WSX'}&from=2026-08-26T00:00:00Z&to=2026-09-10T00:00:00Z`,
     ])};
     return null; })()`);
  return {gets:[...new Set(seen)].slice(0,10)};
};
