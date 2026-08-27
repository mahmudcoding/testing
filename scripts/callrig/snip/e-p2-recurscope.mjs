import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Daily standup'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(800); await chip.click();
  await page.waitForTimeout(4000);
  out.card = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return (d.innerText||'').replace(/\\n+/g,' | ').slice(0,180); })()`);
  // EDIT dialog — full text, looking for any scope wording
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); return clickDeepest(d,/^Edit$/); })()`);
  await page.waitForTimeout(3500);
  out.editDialogFullText = await page.evaluate(`(() => { ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis); const d=ds[ds.length-1];
    return (d.innerText||'').replace(/\\n+/g,' | ').slice(0,600); })()`);
  out.editScopeWords = await page.evaluate(`(() => { ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis); const d=ds[ds.length-1];
    const t=(d.innerText||'');
    return {series:/series/i.test(t), occurrence:/occurrence/i.test(t), repeats:/repeat/i.test(t),
      thisEvent:/this event|all events|only this/i.test(t)}; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  // DELETE confirm — for contrast
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); return clickDeepest(d,/^\\s*Delete\\s*$/); })()`);
  await page.waitForTimeout(2500);
  out.deleteConfirmText = await page.evaluate(`(() => { ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis); const d=ds[ds.length-1];
    return (d.innerText||'').replace(/\\n+/g,' | ').slice(-240); })()`);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis); const d=ds[ds.length-1];
    return clickDeepest(d, /^Cancel$/); })()`);
  return out;
};
