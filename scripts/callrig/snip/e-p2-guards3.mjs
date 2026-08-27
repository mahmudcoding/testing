import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // finding 4 guard: editing a NON-recurring meeting gains no extra question
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const chips = page.locator('button[data-testid="calendar-event-chip"]');
  out.chipCount = await chips.count();
  // find a NON-repeating one by opening cards until we see one without "Repeats"
  for(let i=0;i<Math.min(6, out.chipCount);i++){
    await chips.nth(i).scrollIntoViewIfNeeded().catch(()=>{});
    const b=await chips.nth(i).boundingBox(); if(!b) continue;
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(200);
    await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
    await page.waitForTimeout(2600);
    const card = await page.evaluate(`(() => { ${boxVis}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(bv).pop();
       if(!d) return null; const t=(d.innerText||'').replace(/\\s+/g,' ');
       return {repeats:/Repeats/.test(t), head:t.slice(0,50)}; })()`);
    if(card && !card.repeats){
      // open Edit and look for scope language
      const e = await page.evaluate(`(() => { ${VISFN} ${boxVis}
         const d=[...document.querySelectorAll('[role=dialog]')].filter(bv).pop();
         const b=[...d.querySelectorAll('button[aria-label="Edit"]')].filter(vis)[0];
         if(!b) return null; const r=b.getBoundingClientRect();
         return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
      if(e){ await page.mouse.move(e.cx,e.cy); await page.waitForTimeout(200);
        await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
        await page.waitForTimeout(3000);
        out.nonRecurringEdit = await page.evaluate(`(() => { ${boxVis}
           const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
           const t=(d.innerText||'').replace(/\\s+/g,' ');
           return {scopeWords:['series','occurrence','this event','all events','only this']
                     .filter(w=>new RegExp(w,'i').test(t)),
                   head:t.slice(0,60)}; })()`);
        out.usedCard=card.head; }
      break; }
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  }
  await page.keyboard.press('Escape');
  return out;
};
