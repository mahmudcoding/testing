import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/calendar/meetings')&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,120);}catch(e){} writes.push(r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E invite body probe');
  await page.locator('input[data-field="event-start"]').first().fill('2026-08-27');
  await page.waitForTimeout(500);
  await page.locator('input[data-field="event-start-time"]').first().fill('12:00');
  await page.waitForTimeout(500);
  await page.locator('input[data-field="event-end"]').first().fill('2026-08-27');
  await page.waitForTimeout(500);
  await page.locator('input[data-field="event-end-time"]').first().fill('12:30');
  await page.waitForTimeout(800);
  const sm=page.locator('input[placeholder="Search members"]').first();
  await sm.scrollIntoViewIfNeeded(); await sm.fill('Bob');
  await page.waitForTimeout(2200);
  out.pick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /QA Bob/); })()`);
  await page.waitForTimeout(2000);
  out.selected = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return ((d.innerText||'').match(/Selected \\(\\d+\\)/)||['none'])[0]; })()`);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6000);
  out.created = writes[0]||'(none)';
  return out;
};
