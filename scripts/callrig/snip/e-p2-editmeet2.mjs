import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET'){ let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
      api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,42)+' | req='+(r.request().postData()||'').slice(0,190)); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const chip = page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'invite body probe'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
  await chip.click(); await page.waitForTimeout(4500);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); clickDeepest(d, /^Edit/); })()`);
  await page.waitForTimeout(4500);
  // open the start date/time picker
  out.pickerOpen = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Date and time/.test(x.getAttribute('aria-label')||x.textContent||''));
     if(!b) return 'no date button'; b.click(); return 'opened'; })()`);
  await page.waitForTimeout(3000);
  out.picker = await page.evaluate(`(() => { ${VISFN}
     const pops=[...document.querySelectorAll('[role=dialog],[data-state=open],[class*=popover]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>100&&r.height>60;});
     const p=pops[pops.length-1];
     return { inputs:[...p.querySelectorAll('input')].filter(vis)
                .map(i=>'type='+(i.getAttribute('type')||'-')+' df='+(i.getAttribute('data-field')||'-')+' val="'+String(i.value||'').slice(0,12)+'"').slice(0,8),
              buttons:[...new Set([...p.querySelectorAll('button')].filter(vis)
                .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,18)).filter(Boolean))].slice(0,14) }; })()`);
  // try setting a time input if one exists in the picker
  const timeInputs = await page.locator('input[type=time]').count();
  out.timeInputs = timeInputs;
  if (timeInputs) { await page.locator('input[type=time]').first().fill('15:00'); await page.waitForTimeout(1200); }
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  // also retitle, so the edit is unambiguous either way
  const ti = page.locator('input[data-field="event-title"]').first();
  await ti.fill('QA-E invite body probe RESCHEDULED');
  await page.waitForTimeout(1200);
  api.length=0;
  out.save = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /^Save$/); })()`);
  await page.waitForTimeout(9000);
  out.api = api.slice(0,3);
  return out;
};
