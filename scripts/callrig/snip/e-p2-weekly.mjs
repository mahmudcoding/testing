import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/calendar')&&r.request().method()!=='GET') writes.push(r.request().method()+' -> '+r.status()); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E Weekly sync');
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-02');
  await page.waitForTimeout(500);
  await page.locator('input[data-field="event-start-time"]').first().fill('14:00');
  await page.waitForTimeout(1200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Repeat$|Does not repeat/); })()`);
  await page.waitForTimeout(1800);
  out.pick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=listbox],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1]||document.body;
    return clickDeepest(p, /^Every week$/); })()`);
  await page.waitForTimeout(1800);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6500);
  out.writes = writes.slice(0,2);
  out.occurrences = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-25T00:00:00.000Z&to=2027-06-01T00:00:00.000Z',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=(j.meetings||[]).filter(m=>/Weekly sync/i.test(m.title));
    return {n:a.length, first:a[0]?a[0].starts_at.slice(0,10):null, last:a.length?a[a.length-1].starts_at.slice(0,10):null,
      weekdays:[...new Set(a.map(m=>new Date(m.starts_at).getUTCDay()))],
      sample:a.slice(0,5).map(m=>m.starts_at.slice(0,10))}; })()`);
  return out;
};
