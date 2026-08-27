import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const patches=[];
  page.on('response', r => { const u=r.url();
    if(u.includes('/api/v1/calendar/meetings')&&['PATCH','POST','PUT'].includes(r.request().method()))
      patches.push(r.request().method()+' '+r.status()+' '+u.split('/api/v1/')[1].slice(0,44)+' | '+(r.request().postData()||'').slice(0,200)); });
  await page.goto(BASE+'/w/'+WS+'/calendar/S4OWSESS9KOG8BT', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(d) clickDeepest(d, /^Edit/); })()`);
  await page.waitForTimeout(4500);
  out.timesBefore = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return (t.match(/\\w{3} \\d{1,2}, \\d{1,2}:\\d{2} [AP]M/g)||[]).slice(0,2); })()`);
  const sm=page.locator('input[placeholder="Search members"]').first();
  await sm.scrollIntoViewIfNeeded(); await sm.fill('Carol');
  await page.waitForTimeout(2500);
  out.pick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /QA Carol/); })()`);
  await page.waitForTimeout(2200);
  out.timesAfterPick = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {times:(t.match(/\\w{3} \\d{1,2}, \\d{1,2}:\\d{2} [AP]M/g)||[]).slice(0,2),
             selected:(t.match(/Selected \\(\\d+\\)/)||['none'])[0]}; })()`);
  patches.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Save$/); })()`);
  await page.waitForTimeout(9000);
  out.requests = patches.slice(0,3);
  return out;
};
