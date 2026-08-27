import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  return await page.evaluate(`(() => { ${VISFN}
     const n=new Date();
     const m=document.querySelector('main');
     const rows=[...m.querySelectorAll('[data-testid="calendar-hour-row"]')].map(e=>{
       const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
       return {x:Math.round(r.left), y:Math.round(r.top), disabled:cs.cursor==='not-allowed'};});
     // 7 distinct x buckets = 7 day columns, left to right
     const xs=[...new Set(rows.map(r=>r.x))].sort((a,b)=>a-b);
     // 24 distinct y buckets = hours, top to bottom
     const ys=[...new Set(rows.map(r=>r.y))].sort((a,b)=>a-b);
     const dates=[...new Set([...m.querySelectorAll('[data-testid^="week-col-head-"]')]
        .map(e=>e.getAttribute('data-testid').replace('week-col-head-','')))].sort();
     const grid={};
     for(let ci=0; ci<xs.length; ci++){
       const date=dates[ci]||('col'+ci);
       const col=rows.filter(r=>r.x===xs[ci]).sort((a,b)=>a.y-b.y);
       const disabledHours=col.map((r,i)=>r.disabled?i:null).filter(v=>v!==null);
       grid[date]={n:col.length, nDisabled:disabledHours.length,
                   disabledHourIdx: disabledHours.length>6 ? (disabledHours[0]+'..'+disabledHours[disabledHours.length-1]) : disabledHours.join(',')};
     }
     return {localDate:n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0'),
             localTime:n.toTimeString().slice(0,5), utcTime:n.toISOString().slice(11,16),
             nCols:xs.length, nRowsPerCol:ys.length, dates, grid}; })()`);
};
