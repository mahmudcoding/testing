import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(400); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const chips = page.locator('button[data-testid="calendar-event-chip"]');
  out.chips = await chips.count();
  if(!out.chips) return out;
  out.opened = await mc(page, chips.nth(0));
  await page.waitForTimeout(3000);
  const CARD = `(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
     if(!d) return {open:false};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {open:true,
       organizerLine:(t.match(/Scheduled by[^·|]{0,26}/)||[''])[0].trim(),
       unavailable:/unavailable|недоступ/i.test(t)}; })()`;
  const frames=[]; const t0=Date.now();
  for(let i=0;i<120;i++){
    let f=null;
    try{ f=await page.evaluate(CARD); }catch(e){ f={err:String(e.message||e).slice(0,26)}; }
    frames.push({ms:Date.now()-t0, ...f});
    // provoke background refetches: blur/focus the document a few times
    if(i===20||i===50||i===80){
      try{ await page.evaluate(`window.dispatchEvent(new Event('blur'))`); await page.waitForTimeout(120);
           await page.evaluate(`window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'))`); }catch(e){}
    }
    await page.waitForTimeout(300);
  }
  const key=f=>JSON.stringify([f.open,f.organizerLine,f.unavailable,f.err]);
  const kept=[]; let last=null;
  for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
  out.spanMs=frames[frames.length-1].ms;
  out.everUnavailable=frames.some(f=>f.unavailable);
  out.distinctStates=kept.length;
  out.changes=kept.slice(0,10);
  return out;
};
