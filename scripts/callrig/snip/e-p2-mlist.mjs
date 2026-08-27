import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  // read chips and their hrefs / click targets
  return await page.evaluate(`(() => {
    const chips=[...document.querySelectorAll('[data-testid="calendar-event-chip"]')];
    return chips.map(c=>{ const r=c.getBoundingClientRect();
      return (c.innerText||'').replace(/\\s+/g,' ').slice(0,42)+' | y='+Math.round(r.y)+' | id='+(c.getAttribute('data-meeting-id')||c.getAttribute('data-id')||c.id||'-'); }); })()`);
};
