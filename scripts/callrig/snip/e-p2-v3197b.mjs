import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(400); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
export default async ({page}) => {
  const out={}; const calls=[];
  page.on('response', r=>{ const u=r.url();
    if(/\/api\/v1\/(calendar|meetings)/.test(u)) calls.push({t:Date.now(), u:u.split('/api/v1/')[1].slice(0,40)}); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const chips = page.locator('button[data-testid="calendar-event-chip"]');
  await mc(page, chips.nth(0));
  await page.waitForTimeout(3000);
  const CARD = `(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
     if(!d) return {open:false};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {open:true, org:(t.match(/Scheduled by[^·|]{0,22}/)||[''])[0].trim(),
             unavailable:/unavailable|недоступ/i.test(t)}; })()`;
  const t0=Date.now(); calls.length=0;
  const frames=[];
  for(let i=0;i<140;i++){
    let f=null;
    try{ f=await page.evaluate(CARD); }catch(e){ f={err:1}; }
    frames.push({ms:Date.now()-t0, ...f});
    if(i%25===24){
      // force an actual refetch: invalidate by dispatching focus AND re-requesting the range
      try{ await page.evaluate(`(async()=>{ document.dispatchEvent(new Event('visibilitychange'));
             window.dispatchEvent(new Event('focus'));
             await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-24T00:00:00.000Z&to=2026-09-02T00:00:00.000Z',{credentials:'include'});
           })()`); }catch(e){}
    }
    await page.waitForTimeout(250);
  }
  out.spanMs=frames[frames.length-1].ms;
  out.calendarCallsDuringPoll=calls.length;
  out.callTimeline=calls.slice(0,8).map(c=>({at:c.t-t0, u:c.u}));
  out.everUnavailable=frames.some(f=>f.unavailable);
  out.everClosed=frames.some(f=>f.open===false);
  const key=f=>JSON.stringify([f.open,f.org,f.unavailable,f.err]);
  const kept=[]; let last=null;
  for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
  out.distinctStates=kept.length; out.changes=kept.slice(0,8);
  return out;
};
