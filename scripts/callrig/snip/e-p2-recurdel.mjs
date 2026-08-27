import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const occ = `(async()=>{
  const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-26T19:00:00.000Z&to=2026-09-02T19:00:00.000Z',{credentials:'include'});
  const j=await r.json().catch(()=>({})); const a=j.meetings||[];
  return a.filter(m=>/standup/i.test(m.title)).map(m=>m.starts_at.slice(0,10)); })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/calendar')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,46)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  out.before = await page.evaluate(occ);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Daily standup'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  out.cardText = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return (d.innerText||'').replace(/\\n+/g,' | ').slice(0,220); })()`);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); return clickDeepest(d,/^\\s*Delete\\s*$/); })()`);
  await page.waitForTimeout(2500);
  out.confirmText = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis).pop();
    return d? {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(-260), ctrls:interactives(d).map(x=>x.label.slice(0,26)).join(' | ')}:'none'; })()`);
  writes.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^(Delete meeting|Delete)$/); })()`);
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,2);
  out.after = await page.evaluate(occ);
  return out;
};
