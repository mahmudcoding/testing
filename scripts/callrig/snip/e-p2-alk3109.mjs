import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', async r => { if(r.url().includes('/api/v1/calendar/meetings')&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,110);}catch(e){}
    posts.push(r.status()+' :: '+(r.request().postData()||'').slice(0,180)); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E allday today');
  // ALK-2972 also: put a description in
  const desc = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const e=[...d.querySelectorAll('textarea,[contenteditable="true"],input')].filter(vis)
       .find(x=>/description|описан/i.test(x.getAttribute('placeholder')||x.getAttribute('aria-label')||''));
     return e? (e.tagName+'/'+(e.getAttribute('placeholder')||e.getAttribute('aria-label')||'')) : '(no description field)'; })()`);
  out.descField = desc;
  // turn on All day (a label-associated switch)
  out.allDayClick = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const sw=[...d.querySelectorAll('[role=switch],input[type=checkbox]')].filter(vis);
     const labels=sw.map(s=>{ let p=s,txt=''; for(let i=0;i<4&&p;i++){p=p.parentElement; if(p){const t=(p.innerText||'').trim(); if(t&&t.length<40){txt=t;break;}}} return txt; });
     const i=labels.findIndex(t=>/All day/i.test(t));
     if(i<0) return 'All day switch not found; labels: '+labels.slice(0,5).join(' | ');
     sw[i].click(); return 'clicked, label="'+labels[i]+'"'; })()`);
  await page.waitForTimeout(2200);
  out.afterAllDay = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); f[k]=i?String(i.value):'(absent)'; });
     return {fields:f, text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,150)}; })()`);
  // set start date to TODAY
  await page.locator('input[data-field="event-start"]').first().fill('2026-08-26');
  await page.waitForTimeout(1500);
  posts.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Schedule meeting$/); })()`);
  await page.waitForTimeout(7000);
  out.post = posts[0]||'(no POST — blocked client-side)';
  out.notice = await page.evaluate(`(() => { ${VISFN}
     const strict=el=>{const r=el.getBoundingClientRect(); return r.width>=24&&r.height>=12&&vis(el);};
     return [...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strict)
       .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,2); })()`);
  out.dialogStillOpen = await page.evaluate(`(() => { ${boxVisFn}
     return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length>0; })()`);
  return out;
};
