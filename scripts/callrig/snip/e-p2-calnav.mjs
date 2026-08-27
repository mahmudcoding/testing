import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(300); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(180);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(1400); return true; };
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await mc(page, page.locator('main button').filter({hasText:/^Month$/}).last());
  await page.waitForTimeout(2500);
  const read = `(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const hdr=(t.match(/\\b(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}/)||[''])[0];
     const cells=[...m.querySelectorAll('[data-testid="calendar-month-cell"]')];
     const nums=[...m.querySelectorAll('[data-testid^="month-day-num-"]')]
       .map(e=>e.getAttribute('data-testid').replace('month-day-num-',''));
     return {header:hdr, cells:cells.length, firstDate:nums[0]||null, lastDate:nums[nums.length-1]||null,
             uniqueDates:[...new Set(nums)].length}; })()`;
  // find the "next month" control
  const nav = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     return [...m.querySelectorAll('button')].filter(vis)
       .map(b=>({tx:(b.innerText||'').trim().slice(0,18), al:(b.getAttribute('aria-label')||'').slice(0,26)}))
       .filter(b=>/next|prev|previous|forward|back|→|←/i.test(b.tx+' '+b.al)).slice(0,6); })()`);
  out.navControls = nav;
  const nextBtn = page.locator('main button').filter({has: page.locator('svg')}).nth(0);
  const steps=[await page.evaluate(read)];
  // click "next" 5 times to cross the year boundary (Aug 2026 -> Jan 2027)
  for(let i=0;i<6;i++){
    const b = page.locator('main button[aria-label]').filter({hasText:/^$/});
    const nb = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main');
       const c=[...m.querySelectorAll('button')].filter(vis)
         .find(x=>/next month|next period|next/i.test((x.getAttribute('aria-label')||'')));
       if(!c) return null; const r=c.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2), al:c.getAttribute('aria-label')}; })()`);
    if(!nb){ out.noNextControl=true; break; }
    out.nextLabel = nb.al;
    await page.mouse.move(nb.cx,nb.cy); await page.waitForTimeout(200);
    await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
    await page.waitForTimeout(2200);
    steps.push(await page.evaluate(read));
  }
  out.steps = steps;
  return out;
};
