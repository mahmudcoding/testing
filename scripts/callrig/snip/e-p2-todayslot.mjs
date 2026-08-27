import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  return await page.evaluate(`(() => { ${VISFN}
    const c=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
      .filter(b=>/Create event/i.test(b.getAttribute('aria-label')||''));
    const pick = re => { const el=c.find(b=>re.test(b.getAttribute('aria-label')||'')); if(!el) return null;
      const cs=getComputedStyle(el);
      return {label:el.getAttribute('aria-label'), disabled:el.disabled, cursor:cs.cursor, opacity:cs.opacity}; };
    return { total:c.length,
             disabledCount:c.filter(b=>b.disabled).length,
             monday_pastDay:   pick(/Monday at 14:00/),
             wed_pastHourToday:pick(/Wednesday at 9:00/),
             wed_nextHourToday:pick(/Wednesday at 21:00/),
             thu_future:       pick(/Thursday at 9:00/) }; })()`);
};
