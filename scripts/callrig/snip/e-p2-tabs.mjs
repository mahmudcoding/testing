import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for(const q of ['general','Alice','qa']){
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7500);
    await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
       if(b) b.click(); })()`);
    await page.waitForTimeout(2600);
    await page.keyboard.type(q); await page.waitForTimeout(4800);
    out[q] = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       if(!d) return {err:'no dialog'};
       const tabs=[...d.querySelectorAll('[role=tab]')].filter(vis)
         .map(e=>({tx:(e.innerText||'').replace(/\\s+/g,' ').trim(), sel:e.getAttribute('aria-selected')}));
       const opts=[...d.querySelectorAll('[role=option]')].filter(vis)
         .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,44));
       return {tabs, nOpts:opts.length, opts:opts.slice(0,5)}; })()`);
    // now click the People tab specifically
    const people = page.locator('[role=dialog] [role=tab]').filter({hasText:/^People/}).last();
    if(await people.count()){
      const b=await people.boundingBox();
      await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(250);
      await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
      await page.waitForTimeout(3000);
      out[q].afterPeopleTab = await page.evaluate(`(() => { ${VISFN}
         const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
         const t=[...d.querySelectorAll('[role=tab]')].filter(vis).find(e=>/^People/.test(e.innerText||''));
         const opts=[...d.querySelectorAll('[role=option]')].filter(vis)
           .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,40));
         const body=(d.innerText||'').replace(/\\s+/g,' ');
         return {tabSel:t?t.getAttribute('aria-selected'):null, nOpts:opts.length, opts:opts.slice(0,4),
                 emptyMsg:(body.match(/No .{0,40}/)||[''])[0]}; })()`);
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  }
  return out;
};
