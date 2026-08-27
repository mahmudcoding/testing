import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  const state = `(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); f[k]=i?String(i.value):'(absent)'; });
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const sum=(t.match(/\\w{3}, \\w{3} \\d{1,2} · [^·]+· \\d+ ?\\w+/)||t.match(/\\w{3} \\d{1,2}, \\d{1,2}:\\d{2} [AP]M/g)||['(no summary)']);
     return {fields:f, summary:Array.isArray(sum)?sum.slice(0,2):sum}; })()`;
  for (const run of [1,2]) {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8500);
    await page.getByRole('button',{name:'New meeting'}).first().click();
    await page.waitForTimeout(3400);
    const before = await page.evaluate(state);
    // change ONLY the start date
    await page.locator('input[data-field="event-start"]').first().fill(run===1?'2026-09-04':'2026-10-15');
    await page.waitForTimeout(2500);
    const after = await page.evaluate(state);
    out['run'+run] = { before, after,
      endFollowed: after.fields['event-end']===after.fields['event-start'],
      endStaleOn: after.fields['event-end'],
      startNow: after.fields['event-start'] };
    out['run'+run].holds = !out['run'+run].endFollowed;
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')].filter(e=>e.getBoundingClientRect().width>80).pop();
       if(d) clickDeepest(d, /^(Discard|Yes|Close)$/); })()`);
    await page.waitForTimeout(1500);
  }
  return out;
};
