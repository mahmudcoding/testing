import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const MID='S4OWSESS9KOG8BT';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  // switch to Month so every chip renders
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('main'), /^Month$/); })()`);
  await page.waitForTimeout(5000);
  const grid = `(() => { ${VISFN}
     const chips=[...document.querySelectorAll('[data-testid="calendar-event-chip"]')].filter(vis)
       .map(c=>(c.innerText||'').replace(/\\s+/g,' ').trim());
     return {visible:chips.length, target:chips.filter(c=>/RESCHEDULED/i.test(c)).length}; })()`;
  out.before = await page.evaluate(grid);
  out.statusBefore = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-25T00:00:00Z&to=2026-09-01T00:00:00Z',{credentials:'include'});
     const d=await r.json(); const m=(d.meetings||[]).find(x=>x.id==='${MID}'); return m? m.my_status:'(not in list)'; })()`);
  if(out.before.target===0){ out.skip='target chip not visible even in Month view'; }
  out.decline = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings/${MID}/respond',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'declined'})});
     return r.status; })()`);
  const s=[]; for(let i=0;i<20;i++){ await page.waitForTimeout(500); s.push(await page.evaluate(grid)); }
  out.afterDeclineNoReload = s[s.length-1];
  out.firstGone = (()=>{ for(let i=0;i<s.length;i++) if(s[i].target===0) return {atMs:(i+1)*500}; return null; })();
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('main'), /^Month$/); })()`);
  await page.waitForTimeout(4500);
  out.afterReload = await page.evaluate(grid);
  out.restore = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings/${MID}/respond',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'accepted'})});
     return r.status; })()`);
  return out;
};
