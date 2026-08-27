import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'QA-E RSVP three'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4500);
  out.card = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? (d.innerText||'').replace(/\\n+/g,' | ').slice(0,240) : 'no card'; })()`);
  out.hasUnavailable = /Participant list unavailable/.test(out.card);
  out.byIdKeys = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/calendar/meetings/S4OWKW57UWOK0WU',{credentials:'include'});
    const t=await r.text(); const j=JSON.parse(t);
    return {topLevelKeys:Object.keys(j).join(','), hasAttendees:/"attendees"/.test(t), len:t.length}; })()`);
  return out;
};
