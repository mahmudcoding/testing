import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const st = `(() => { ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return {closed:true};
  const t=(d.innerText||'').replace(/\\n+/g,' | ');
  return {fields:[...d.querySelectorAll('input')].filter(i=>/event-(start|end)/.test(i.getAttribute('data-field')||''))
      .map(i=>i.getAttribute('data-field')+'='+i.value).join('  '),
    summary:(t.match(/\\w{3}, \\w{3} \\d+[^|]*/)||[''])[0].trim().slice(0,60),
    err:(t.match(/[^|]*(must be|invalid|required)[^|]*/i)||[''])[0].trim().slice(0,70)}; })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/calendar')&&r.request().method()!=='GET') writes.push(r.request().method()+' -> '+r.status()); });
  for (const run of [1,2]) {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500);
    await page.getByRole('button',{name:'New meeting'}).first().click();
    await page.waitForTimeout(3000);
    const o={};
    o.a_default = await page.evaluate(st);
    await page.locator('input[data-field="event-title"]').first().fill('QA-E date-follow '+run);
    // change ONLY the start date to a future day
    await page.locator('input[data-field="event-start"]').first().fill('2026-09-04');
    await page.waitForTimeout(1500);
    o.b_afterStartDateChange = await page.evaluate(st);
    // also change only the start TIME, for contrast
    await page.locator('input[data-field="event-start-time"]').first().fill('11:00');
    await page.waitForTimeout(1500);
    o.c_afterStartTimeChange = await page.evaluate(st);
    writes.length=0;
    await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
    await page.waitForTimeout(4500);
    o.d_afterSubmit = await page.evaluate(st);
    o.writes = writes.slice(0,2);
    out['run'+run]=o;
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  }
  return out;
};
