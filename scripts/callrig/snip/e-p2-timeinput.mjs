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
  out.inputs = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     return ['event-start','event-start-time','event-end','event-end-time'].map(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]');
       return i?{k, type:i.type, value:i.value, step:i.step, min:i.min, max:i.max}:{k, missing:true};
     }); })()`);
  // type into the end time using keyboard segments (a native time input takes HHMM)
  const endt = page.locator('input[data-field="event-end-time"]').first();
  const startt = page.locator('input[data-field="event-start-time"]').first();
  await startt.click(); await page.waitForTimeout(300);
  await page.keyboard.type('1400'); await page.waitForTimeout(1500);
  out.afterStartType = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const f={}; ['event-start-time','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); }); return f; })()`);
  await endt.click(); await page.waitForTimeout(300);
  await page.keyboard.type('0900'); await page.waitForTimeout(1800);
  out.afterEndType = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const f={}; ['event-start-time','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); });
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {fields:f, hasSummary:/\\d{1,2}:\\d{2}\\s*(AM|PM)?\\s*–/.test(t),
             anyError:/required|must be|invalid|ошиб/i.test(t)}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
