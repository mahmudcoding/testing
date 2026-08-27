import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const MID='S4OWSESS9KOG8BT';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.restore = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings/${MID}/respond',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'accepted'})});
     return r.status; })()`);
  await page.waitForTimeout(2500);
  const openCard = async () => {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8500);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       clickDeepest(document.querySelector('main'), /^Month$/); })()`);
    await page.waitForTimeout(5500);
    const t = await page.evaluate(`(() => { ${VISFN}
       const c=[...document.querySelectorAll('[data-testid="calendar-month-event-chip"]')].filter(vis)
         .find(x=>/RESCHEDULED/i.test(x.textContent||''));
       if(!c) return {none:true}; const r=c.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return false;
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
    await page.waitForTimeout(5000); return true;
  };
  const st = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return {none:true};
     return [...d.querySelectorAll('button')].filter(vis)
       .filter(b=>/^(Yes|No)$/.test((b.textContent||'').trim()))
       .map(b=>(b.textContent||'').trim()+'/pressed='+b.getAttribute('aria-pressed')); })()`;
  out.opened = await openCard();
  out.afterRestore = await page.evaluate(st);
  // reload and re-open: does the Yes state persist?
  out.reopened = await openCard();
  out.afterReload = await page.evaluate(st);
  out.apiStatus = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-25T00:00:00Z&to=2026-09-01T00:00:00Z',{credentials:'include'});
     const d=await r.json(); const m=(d.meetings||[]).find(x=>x.id==='${MID}'); return m? m.my_status:'(not in list)'; })()`);
  return out;
};
