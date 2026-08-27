import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET') api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,40)+' | req='+(r.request().postData()||'').slice(0,200)); });
  const openEdit = async () => {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8000);
    const chip = page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'RESCHEDULED'}).first();
    await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
    await chip.click(); await page.waitForTimeout(4500);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); clickDeepest(d, /^Edit/); })()`);
    await page.waitForTimeout(4500);
  };
  const state = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return {none:true};
     const radios=[...d.querySelectorAll('input[type=radio]')].map(r=>r.value+'='+r.checked);
     const boxes=[...d.querySelectorAll('input[type=checkbox]')].map((c,i)=>'cb'+i+'='+c.checked);
     const dur=[...d.querySelectorAll('button')].filter(vis)
       .filter(b=>/^(15 min|30 min|45 min|1 hr|1\\.5 hr|2 hr)$/.test((b.textContent||'').trim()))
       .map(b=>(b.textContent||'').trim()+'/p='+b.getAttribute('aria-pressed')+'/c='+b.getAttribute('aria-checked')
              +'/sel='+(b.getAttribute('data-state')||'-'));
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {radios, boxes, dur, times:(t.match(/Aug \\d+, \\d+:\\d+ [AP]M/g)||[]).slice(0,2)}; })()`;
  await openEdit();
  out.before = await page.evaluate(state);
  // switch access to Private and duration to 1 hr
  out.acts = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const r1=clickDeepest(d, /^Private$/);
     const r2=clickDeepest(d, /^1 hr$/);
     return [r1,r2]; })()`);
  await page.waitForTimeout(2000);
  out.afterClicks = await page.evaluate(state);
  api.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); clickDeepest(d, /^Save$/); })()`);
  await page.waitForTimeout(9000);
  out.saveReq = api.slice(0,2);
  await openEdit();
  out.afterReopen = await page.evaluate(state);
  await page.keyboard.press('Escape');
  return out;
};
