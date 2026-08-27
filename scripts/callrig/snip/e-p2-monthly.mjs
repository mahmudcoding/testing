import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/calendar')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,200);}catch(e){}
    writes.push(r.request().method()+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E Monthly 31st');
  await page.locator('input[data-field="event-start"]').first().fill('2026-08-31');
  await page.waitForTimeout(500);
  await page.locator('input[data-field="event-start-time"]').first().fill('10:00');
  await page.waitForTimeout(1200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Repeat$|Does not repeat/); })()`);
  await page.waitForTimeout(1800);
  out.pick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=listbox],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1]||document.body;
    return clickDeepest(p, /^Every month$/); })()`);
  await page.waitForTimeout(1800);
  out.formState = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const t=(d.innerText||'').replace(/\\n+/g,' | ');
    return {repeat:(t.match(/Repeat[^|]*\\|[^|]*/)||[''])[0].slice(0,60),
      summary:(t.match(/\\w{3}, \\w{3} \\d+[^|]*/)||[''])[0].slice(0,60),
      fields:[...d.querySelectorAll('input')].filter(i=>i.getAttribute('data-field')).map(i=>i.getAttribute('data-field')+'='+i.value).join(' ')}; })()`);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6500);
  out.writes = writes.slice(0,2);
  out.occurrences = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-01T00:00:00.000Z&to=2027-03-01T00:00:00.000Z',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.meetings||[];
    return a.filter(m=>/Monthly 31/i.test(m.title)).map(m=>m.starts_at); })()`);
  return out;
};
