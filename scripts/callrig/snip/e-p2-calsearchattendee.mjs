import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const res = `(() => { ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  return d? (d.innerText||'').replace(/\\n+/g,' | ').slice(0,200) : '(no dialog)'; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /^Month$/); })()`);
  await page.waitForTimeout(4500);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main'); return clickDeepest(m, /^Search$/); })()`);
  await page.waitForTimeout(2500);
  const inp = page.locator('input[aria-label="Search events"]').first();
  for (const q of ['RSVP three','Bob','QA Bob','26 August','August 26','2026-08-31','31']) {
    await inp.fill(''); await page.waitForTimeout(500);
    await inp.fill(q); await page.waitForTimeout(3200);
    out['['+q+']'] = (await page.evaluate(res)).replace('Search events | ESC | ','').slice(0,120);
  }
  return out;
};
