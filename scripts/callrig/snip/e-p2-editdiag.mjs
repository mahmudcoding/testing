import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const chip = page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'invite body probe'}).first();
  out.chips = await page.locator('[data-testid="calendar-event-chip"]').count();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
  await chip.click(); await page.waitForTimeout(5000);
  const dump = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return {none:true};
     return { text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,240),
              buttons:[...new Set([...d.querySelectorAll('button')].filter(vis)
                .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26)).filter(Boolean))].slice(0,16),
              inputs:[...d.querySelectorAll('input,textarea,select')].filter(vis)
                .map(i=>i.tagName.toLowerCase()+' df='+(i.getAttribute('data-field')||'-')+' type='+(i.getAttribute('type')||'-')+' val="'+String(i.value||'').slice(0,14)+'"').slice(0,12) }; })()`;
  out.card = await page.evaluate(dump);
  out.editClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /^Edit/); })()`);
  await page.waitForTimeout(5000);
  out.editForm = await page.evaluate(dump);
  return out;
};
