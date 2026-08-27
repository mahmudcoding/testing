import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // ALK-1967: does a recurring occurrence's details say it repeats?
  // ALK-2009: can the organiser delete an event from the details popover?
  // ALK-3069: is there a way to delete a whole series in one action?
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const chip = page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'Daily standup'}).first();
  out.chipFound = await chip.count();
  if(out.chipFound){
    await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
    await chip.click(); await page.waitForTimeout(5000);
    out.card = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       if(!d) return {none:true};
       const t=(d.innerText||'').replace(/\\s+/g,' ');
       return { text:t.slice(0,170),
                saysRepeats:/repeat|повтор|every day|daily/i.test(t),
                buttons:[...new Set([...d.querySelectorAll('button')].filter(vis)
                  .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(x=>x&&x.length<22))].slice(0,10) }; })()`);
    // ALK-2009 + ALK-3069: click Delete and see what it offers
    out.deleteClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       return clickDeepest(d, /^Delete$/); })()`);
    await page.waitForTimeout(3500);
    out.deleteDialog = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>150&&r.height>80;}).pop();
       if(!d) return '(no dialog)';
       return { text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,220),
                buttons:[...new Set([...d.querySelectorAll('button')].filter(vis)
                  .map(b=>(b.textContent||'').trim()).filter(Boolean))].slice(0,8),
                offersSeries:/series|всю серию|all events|all occurrences/i.test(d.innerText||'') }; })()`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
    await page.keyboard.press('Escape');
  }
  return out;
};
