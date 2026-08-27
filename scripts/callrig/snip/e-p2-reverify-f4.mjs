import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const patches=[];
  page.on('response', r => { const u=r.url();
    if(u.includes('/api/v1/calendar/meetings')&&r.request().method()==='PATCH')
      patches.push({url:u.split('/api/v1/')[1].slice(0,50), req:(r.request().postData()||'').slice(0,160)}); });
  const listSeries = `(async () => {
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-26T00:00:00Z&to=2026-09-05T00:00:00Z',{credentials:'include'});
     const d=await r.json(); const a=(d.meetings||[]).filter(m=>/QA-E Daily|Daily/i.test(m.title||''));
     return {n:a.length, titles:[...new Set(a.map(m=>m.title))].slice(0,4),
             byTitle:a.slice(0,6).map(m=>({t:(m.title||'').slice(0,28), d:(m.starts_at||'').slice(0,10)}))}; })()`;
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.before = await page.evaluate(listSeries);
  if(!out.before.n) { out.skip='no recurring series found in window'; return out; }
  // open one occurrence via the API-known id, edit its title
  const target = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-30T00:00:00Z&to=2026-08-31T23:59:59Z',{credentials:'include'});
     const d=await r.json(); const a=(d.meetings||[]).filter(m=>/Daily/i.test(m.title||''));
     return a[0]? {id:a[0].id, title:a[0].title, starts:a[0].starts_at}:null; })()`);
  out.target = target;
  if(!target) { out.skip='no occurrence on the chosen day'; return out; }
  await page.goto(BASE+'/w/'+WS+'/calendar/'+target.id, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.cardOpened = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const root=d||document.querySelector('main');
     return {text:(root.innerText||'').replace(/\\s+/g,' ').slice(0,120),
             buttons:[...new Set([...root.querySelectorAll('button')].filter(vis)
               .map(b=>(b.textContent||'').trim()).filter(x=>x&&x.length<20))].slice(0,10)}; })()`);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(d) clickDeepest(d, /^Edit/); })()`);
  await page.waitForTimeout(4500);
  out.editWarning = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d?d.innerText:'').replace(/\\s+/g,' ');
     return {mentionsSeries:/(all events|this event|series|occurrence|повтор)/i.test(t), head:t.slice(0,150)}; })()`);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E Daily EDITED ONE');
  await page.waitForTimeout(1200);
  patches.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Save$/); })()`);
  await page.waitForTimeout(8000);
  out.patch = patches[0]||'(none)';
  out.afterConfirm = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis).pop();
     return d? (d.innerText||'').replace(/\\s+/g,' ').slice(0,140):'(no dialog)'; })()`);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.after = await page.evaluate(listSeries);
  out.editedCount = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-26T00:00:00Z&to=2026-11-30T00:00:00Z',{credentials:'include'});
     const d=await r.json(); const a=d.meetings||[];
     return {edited:a.filter(m=>/EDITED ONE/.test(m.title||'')).length,
             stillOld:a.filter(m=>/QA-E Daily/.test(m.title||'')&&!/EDITED/.test(m.title||'')).length}; })()`);
  out.holds = out.editedCount.edited===1 && out.editedCount.stillOld>1;
  return out;
};
