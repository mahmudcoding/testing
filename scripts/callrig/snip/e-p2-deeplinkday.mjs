import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const MEET='S4OX2EYG6IHFZ1Q';
const clickLabel = async (page, label) => {
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>(x.innerText||'').trim()===${JSON.stringify(label)});
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t) return false;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(3000); return true;
};
const heading = `(() => { const t=(document.querySelector('main').innerText||'').replace(/\\s+/g,' ');
   return {day:(t.match(/(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\\s+\\d{1,2}\\s+\\w+\\s+\\d{4}/i)||[''])[0],
           week:(t.match(/\\d{1,2}–\\d{1,2}\\s+\\w+\\s+\\d{4}/)||[''])[0],
           top:t.slice(0,70)}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(1000);
  await page.goto(BASE+'/w/'+WS+'/calendar/'+MEET, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  out.clock = await page.evaluate(`(() => { const n=new Date();
     return {local:n.toDateString(), utc:n.toISOString().slice(0,10)}; })()`);
  out.onDeepLink = await page.evaluate(heading);
  const closed = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>200).pop();
     if(!d) return false;
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Close/i.test(x.getAttribute('aria-label')||''));
     if(b){ b.click(); return true; } return false; })()`);
  out.cardClosed = closed;
  await page.waitForTimeout(3000);
  out.afterClose = await page.evaluate(heading);
  await clickLabel(page,'Day');
  await page.waitForTimeout(3500);
  out.afterCloseThenDay = await page.evaluate(heading);
  return out;
};
