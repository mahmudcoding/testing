import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  return await page.evaluate(`(() => { ${VISFN}
     const n=new Date();
     const m=document.querySelector('main');
     // day columns from their headers
     const cols=[...m.querySelectorAll('[data-testid^="week-col-head-"]')].map(e=>{
       const r=e.getBoundingClientRect();
       return {date:e.getAttribute('data-testid').replace('week-col-head-',''),
               x0:r.left, x1:r.right};});
     const rows=[...m.querySelectorAll('[data-testid="calendar-hour-row"]')];
     const info=rows.map(e=>{ const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
       const col=cols.find(c=>r.left>=c.x0-4 && r.right<=c.x1+4);
       return {date:col?col.date:null, y:Math.round(r.top),
               disabled:cs.cursor==='not-allowed'};});
     // hour labels down the left gutter to map y -> hour
     const labels=[...m.querySelectorAll('*')].filter(e=>{
       const own=[...e.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent.trim()).join('');
       return /^\\d{2}:00$/.test(own);}).map(e=>({h:(e.textContent||'').trim(), y:Math.round(e.getBoundingClientRect().top)}));
     const hourFor=y=>{ let best=null,bd=1e9;
       for(const l of labels){ const d=Math.abs(l.y-y); if(d<bd){bd=d;best=l.h;} } return best; };
     const byDate={};
     for(const r of info){ if(!r.date) continue;
       byDate[r.date]=byDate[r.date]||{disabled:[],enabled:[]};
       (r.disabled?byDate[r.date].disabled:byDate[r.date].enabled).push(hourFor(r.y)); }
     const summary={};
     for(const d of Object.keys(byDate)){
       const dis=byDate[d].disabled.filter(Boolean), en=byDate[d].enabled.filter(Boolean);
       summary[d]={nDisabled:dis.length, nEnabled:en.length,
                   lastDisabled:dis.sort().pop()||null, firstEnabled:en.sort()[0]||null}; }
     return {localDate:n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0'),
             localTime:n.toTimeString().slice(0,5), utcDate:n.toISOString().slice(0,10), utcTime:n.toISOString().slice(11,16),
             nCols:cols.length, nRows:rows.length, nLabels:labels.length, byDate:summary}; })()`);
};
