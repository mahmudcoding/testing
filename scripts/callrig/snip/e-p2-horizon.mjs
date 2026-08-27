import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(300); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(180);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(1500); return true; };
const next = async page => {
  const nb = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/^Next$/i.test((x.getAttribute('aria-label')||'')));
     if(!c) return null; const r=c.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!nb) return false;
  await page.mouse.move(nb.cx,nb.cy); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(2300); return true;
};
const state = `(() => { ${VISFN}
   const m=document.querySelector('main');
   const h=((m.innerText||'').match(/\\b(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}/)||[''])[0];
   const cells=[...m.querySelectorAll('[data-testid="calendar-month-cell"]')];
   const withChips=cells.filter(c=>c.querySelector('[data-testid*="event-chip"]'));
   return {header:h, cells:cells.length, withChips:withChips.length,
           lastChipDate:(()=>{ const c=withChips[withChips.length-1];
             const n=c&&c.querySelector('[data-testid^="month-day-num-"]');
             return n?n.getAttribute('data-testid').replace('month-day-num-',''):null; })()}; })()`;
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await mc(page, page.locator('main button').filter({hasText:/^Month$/}).last());
  await page.waitForTimeout(2500);
  const walk=[await page.evaluate(state)];
  for(let i=0;i<7;i++){ if(!await next(page)) break; walk.push(await page.evaluate(state)); }
  return {walk};
};
