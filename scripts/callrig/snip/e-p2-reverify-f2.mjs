import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const MID='S4OWSESS9KOG8BT';
export default async ({page}) => {
  const out={};
  // A — opened by URL (where the notification leads)
  await page.goto(BASE+'/w/'+WS+'/calendar/'+MID, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const rsvp = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const root=d||document.querySelector('main');
     const btns=[...root.querySelectorAll('button')].filter(vis)
       .filter(b=>/^(Yes|No)$/.test((b.textContent||'').trim()));
     const other=[...root.querySelectorAll('button')].filter(vis)
       .filter(b=>/Invite by email/.test(b.textContent||''));
     return { rsvp:btns.map(b=>(b.textContent||'').trim()+'/disabled='+b.disabled
                +'/opacity='+getComputedStyle(b).opacity),
              control:other.map(b=>(b.textContent||'').trim()+'/disabled='+b.disabled),
              cardText:((root.innerText||'').replace(/\\s+/g,' ')).slice(0,140) }; })()`;
  const samples=[]; for(let i=0;i<8;i++){ await page.waitForTimeout(400); samples.push(await page.evaluate(rsvp)); }
  out.byUrl = samples[samples.length-1];
  out.byUrlStable = new Set(samples.map(s=>JSON.stringify(s.rsvp))).size===1;
  out.byUrlApi = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings/${MID}',{credentials:'include'});
     const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){}
     const m=d?(d.meeting||d):{};
     return {st:r.status, topKeys:d?Object.keys(d).join(','):null, hasMyStatus:'my_status' in m}; })()`);
  // B — the same meeting opened from the grid (control)
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const chip = page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'RESCHEDULED'}).first();
  const n = await chip.count();
  out.chipFound = n>0;
  if(n){ await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
    await chip.click(); await page.waitForTimeout(5000);
    out.fromGrid = await page.evaluate(rsvp); }
  out.holds = out.byUrl.rsvp.every(x=>/disabled=true/.test(x))
           && (out.fromGrid? out.fromGrid.rsvp.some(x=>/disabled=false/.test(x)) : null);
  return out;
};
