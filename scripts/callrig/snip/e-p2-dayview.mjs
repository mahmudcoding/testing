import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, label) => {
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>(x.innerText||'').trim()===${JSON.stringify(label)});
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t) return false;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(2600); return true;
};
const read = `(() => {
   const m=document.querySelector('main');
   const t=(m.innerText||'').replace(/\\s+/g,' ');
   const now=new Date();
   return {topLine:t.slice(0,90),
     dayHeading:(t.match(/(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\\s+\\d{1,2}\\s+\\w+\\s+\\d{4}/i)||[''])[0],
     subHeader:(t.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\\s+\\w+\\s+\\d{1,2}/)||[''])[0],
     browserToday: now.toDateString()}; })()`;
export default async ({page}) => {
  const out={};
  // cold load
  await page.goto('about:blank'); await page.waitForTimeout(1200);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  out.onLoad = await page.evaluate(read);
  out.clickedDay = await mc(page,'Day');
  out.afterDay = await page.evaluate(read);
  out.clickedToday = await mc(page,'Today');
  out.afterToday = await page.evaluate(read);
  // and again from a truly cold load, going straight to Day
  await page.goto('about:blank'); await page.waitForTimeout(1200);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  await mc(page,'Day');
  out.coldThenDay = await page.evaluate(read);
  return out;
};
