import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const MID='S4OWSESS9KOG8BT';
export default async ({page}) => {
  const out={}; const calls=[];
  page.on('response', async r => { const u=r.url();
    if(/respond|rsvp|meetings/.test(u)&&r.request().method()!=='GET'){ let b=''; try{b=(await r.text()).slice(0,110);}catch(e){}
      calls.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,44)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const gridState = `(() => { ${VISFN}
     const chips=[...document.querySelectorAll('[data-testid="calendar-event-chip"]')].filter(vis)
       .map(c=>(c.innerText||'').replace(/\\s+/g,' ').trim());
     return {total:chips.length, target:chips.filter(c=>/RESCHEDULED/i.test(c)).slice(0,1)}; })()`;
  out.before = await page.evaluate(gridState);
  out.statusBefore = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-26T00:00:00Z&to=2026-08-29T00:00:00Z',{credentials:'include'});
     const d=await r.json(); const m=(d.meetings||[]).find(x=>x.id==='${MID}');
     return m? m.my_status:'(not visible)'; })()`);
  // decline via the API the UI uses
  calls.length=0;
  out.decline = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings/${MID}/respond',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'declined'})});
     return {st:r.status, body:(await r.text()).slice(0,120)}; })()`);
  // poll the grid WITHOUT reloading
  const s=[]; for(let i=0;i<18;i++){ await page.waitForTimeout(500); s.push(await page.evaluate(gridState)); }
  out.afterDeclineNoReload = s[s.length-1];
  out.everDisappeared = s.some(x=>x.target.length===0);
  out.statusAfter = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-26T00:00:00Z&to=2026-08-29T00:00:00Z',{credentials:'include'});
     const d=await r.json(); const m=(d.meetings||[]).find(x=>x.id==='${MID}');
     return m? m.my_status:'(not in list)'; })()`);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9000);
  out.afterReload = await page.evaluate(gridState);
  // restore: accept again
  out.restore = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings/${MID}/respond',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'accepted'})});
     return {st:r.status}; })()`);
  return out;
};
