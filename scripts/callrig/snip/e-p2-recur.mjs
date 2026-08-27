import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/calendar')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,300);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,40)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E Daily standup');
  await page.locator('input[data-field="event-start"]').first().fill('2026-08-27');
  await page.waitForTimeout(400);
  await page.locator('input[data-field="event-start-time"]').first().fill('09:00');
  await page.waitForTimeout(400);
  await page.locator('input[data-field="event-end"]').first().fill('2026-08-27');
  await page.waitForTimeout(400);
  await page.locator('input[data-field="event-end-time"]').first().fill('09:15');
  await page.waitForTimeout(800);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Repeat$|Does not repeat/); })()`);
  await page.waitForTimeout(1800);
  out.pickDaily = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=listbox],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1]||document.body;
    return clickDeepest(p, /^Every day$/); })()`);
  await page.waitForTimeout(1800);
  out.repeatShown = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const t=(d.innerText||'').replace(/\\n+/g,' | '); const i=t.indexOf('Repeat');
    return t.slice(i, i+90); })()`);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6500);
  out.writes = writes.slice(0,2);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  out.chipsThisWeek = await page.evaluate(`(() => [...document.querySelectorAll('[data-testid="calendar-event-chip"]')]
    .map(c=>{const r=c.getBoundingClientRect(); return (c.innerText||'').replace(/\\s+/g,' ').slice(0,30)+'@x'+Math.round(r.x);})
    .filter(s=>/standup/i.test(s)))()`);
  out.apiWeek = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-26T19:00:00.000Z&to=2026-09-02T19:00:00.000Z',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.meetings||[];
    return a.filter(m=>/standup/i.test(m.title)).map(m=>m.starts_at+' id='+String(m.id).slice(0,12)); })()`);
  return out;
};
