import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(1000);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  out.clock = await page.evaluate(`(() => { const n=new Date();
     return {tz:Intl.DateTimeFormat().resolvedOptions().timeZone,
             localDate:n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0'),
             utcDate:n.toISOString().slice(0,10), localTime:n.toTimeString().slice(0,5)}; })()`);
  // week view: which column is marked as today?
  out.weekToday = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const marked=[...m.querySelectorAll('[aria-current],[data-today="true"],[class*="today"]')].filter(vis)
       .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,18));
     return {header:(t.match(/\\d{1,2}–\\d{1,2}\\s+\\w+\\s+\\d{4}/)||[''])[0], markedToday:[...new Set(marked)].slice(0,4)}; })()`);
  // New meeting default date
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(4000);
  out.newMeetingDefaults = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis).pop();
     if(!d) return {open:false};
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); });
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {open:true, fields:f, summary:(t.match(/\\w{3}, \\w{3} \\d{1,2}[^|]{0,30}/)||[''])[0]}; })()`);
  const ld = out.clock.localDate;
  out.newMeetingUsesLocalDate = out.newMeetingDefaults.fields
    && out.newMeetingDefaults.fields['event-start']===ld;
  await page.keyboard.press('Escape');
  return out;
};
