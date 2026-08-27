import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  return await page.evaluate(`(async () => {
    const r = await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-24T00:00:00.000Z&to=2026-09-12T00:00:00.000Z',{credentials:'include'});
    const j = await r.json(); const arr = j.meetings||j.data||j.items||(Array.isArray(j)?j:[]);
    return arr.filter(m=>/^E2 series/.test(m.title||''))
      .map(m=>({t:m.title, s:(m.starts_at||'').slice(0,16)}))
      .sort((a,b)=>a.s<b.s?-1:1).slice(0,12); })()`);
};
