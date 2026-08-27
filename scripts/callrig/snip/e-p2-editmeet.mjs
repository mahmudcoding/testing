import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET'){ let b=''; try{b=(await r.text()).slice(0,160);}catch(e){}
      api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,44)+' | req='+(r.request().postData()||'').slice(0,170)); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const chip = page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'invite body probe'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
  await chip.click(); await page.waitForTimeout(4500);
  out.card = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return {none:true};
     return { text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,200),
              controls:[...new Set([...d.querySelectorAll('button')].filter(vis)
                .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26)).filter(Boolean))].slice(0,14) }; })()`);
  out.editClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /^Edit/); })()`);
  await page.waitForTimeout(4000);
  out.before = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); const o={};
     ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); o[k]=i?String(i.value||''):'(absent)'; });
     return o; })()`);
  // reschedule 12:00 -> 15:00
  await page.locator('input[data-field="event-start-time"]').first().fill('15:00');
  await page.waitForTimeout(900);
  await page.locator('input[data-field="event-end-time"]').first().fill('15:30');
  await page.waitForTimeout(1200);
  api.length=0;
  out.saveClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /^(Save|Save changes|Update meeting|Update)$/); })()`);
  await page.waitForTimeout(8000);
  out.api = api.slice(0,3);
  return out;
};
