import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  const read = `(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); });
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const err=(t.match(/[A-Z][^.!]{0,70}(must be after|after the start|earlier than)[^.!]{0,30}/i)||[''])[0];
     return {fields:f, error:err, anyRedText:/must be|error|ошибк/i.test(t),
             summary:(t.match(/\\w{3}, \\w{3} \\d{1,2}[^|]{0,40}/)||[''])[0]}; })()`;
  out.before = await page.evaluate(read);
  // same day, end time earlier than start time
  await page.locator('input[data-field="event-start-time"]').first().fill('14:00');
  await page.waitForTimeout(1200);
  out.afterStartTime = await page.evaluate(read);
  await page.locator('input[data-field="event-end-time"]').first().fill('09:00');
  await page.waitForTimeout(2200);
  out.afterEndTime = await page.evaluate(read);
  await page.keyboard.press('Escape');
  return out;
};
