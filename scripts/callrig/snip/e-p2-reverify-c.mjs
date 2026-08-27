import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // F9 — start date change leaves summary/end behind
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3200);
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-10'); await page.waitForTimeout(400);
  await page.locator('input[data-field="event-start-time"]').first().fill('10:00'); await page.waitForTimeout(1600);
  out.F9 = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); f[k]=i?String(i.value):'(absent)'; });
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const dates=(t.match(/\\w{3} \\d{1,2}, \\d{1,2}:\\d{2} [AP]M/g)||[]).slice(0,2);
     return {fields:f, summaryDates:dates, endStillOld: f['event-end']!=='2026-09-10'}; })()`);
  out.F9.holds = out.F9.endStillOld===true;
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')].filter(e=>e.getBoundingClientRect().width>80).pop();
     if(d) clickDeepest(d, /^(Discard|Yes|Close)$/); })()`);
  await page.waitForTimeout(1500);

  // F8 — Files list view does not persist
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const viewState = `(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .filter(x=>/^(Grid view|List view)$/.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
     return b.map(x=>((x.getAttribute('aria-label')||x.textContent||'').trim())+'/p='+x.getAttribute('aria-pressed')+'/c='+x.getAttribute('aria-checked')); })()`;
  out.F8 = {before: await page.evaluate(viewState)};
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/^List view$/.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); await page.waitForTimeout(2500); }
  out.F8.afterClick = await page.evaluate(viewState);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000);
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(8500);
  out.F8.afterReturn = await page.evaluate(viewState);
  out.F8.holds = JSON.stringify(out.F8.afterReturn)===JSON.stringify(out.F8.before)
              && JSON.stringify(out.F8.afterClick)!==JSON.stringify(out.F8.before);
  return out;
};
