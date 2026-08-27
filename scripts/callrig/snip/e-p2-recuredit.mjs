import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const occ = `(async()=>{
  const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-27T19:00:00.000Z&to=2026-09-03T19:00:00.000Z',{credentials:'include'});
  const j=await r.json().catch(()=>({})); const a=j.meetings||[];
  return a.filter(m=>/standup/i.test(m.title)).map(m=>m.starts_at.slice(0,16)+' "'+m.title.slice(0,24)+'"'); })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/calendar')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,130);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,46)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  out.before = await page.evaluate(occ);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Daily standup'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(800); await chip.click();
  await page.waitForTimeout(4000);
  out.openEdit = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); return clickDeepest(d,/^Edit$/); })()`);
  await page.waitForTimeout(3500);
  out.editDialog = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis); const d=ds[ds.length-1];
    if(!d) return 'no dialog';
    const t=(d.innerText||'').replace(/\\n+/g,' | ');
    return {title:t.split(' | ')[0], mentionsSeries:/series|occurrence|repeat|all events|this event/i.test(t),
      seriesCopy:(t.match(/[^|]*(series|occurrence|repeat)[^|]*/i)||[''])[0].trim().slice(0,120),
      ctrls: interactives(d).map(x=>x.label.slice(0,24)).join(' | ').slice(0,300)}; })()`);
  // rename this occurrence
  await page.locator('input[data-field="event-title"]').first().fill('QA-E Daily standup EDITED');
  await page.waitForTimeout(900);
  writes.length=0;
  out.save = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis); const d=ds[ds.length-1];
    return clickDeepest(d, /^Save$/); })()`);
  await page.waitForTimeout(3000);
  out.afterSaveDialog = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis); const d=ds[ds.length-1];
    return d? {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(-220), ctrls:interactives(d).map(x=>x.label.slice(0,24)).join(' | ')}:'no dialog'; })()`);
  await page.waitForTimeout(4000);
  out.writes = writes.slice(0,3);
  out.after = await page.evaluate(occ);
  return out;
};
