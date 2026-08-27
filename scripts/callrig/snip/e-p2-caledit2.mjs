import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const NAME='QA-E RSVP probe';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const topBox = `(() => { ${VISFN} ${boxVisFn}
  const b=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper],[role=menu]')].filter(boxVis);
  const p=b[b.length-1];
  return p? {n:b.length, text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,320),
    inputs:[...p.querySelectorAll('input')].map(i=>(i.getAttribute('data-field')||i.getAttribute('aria-label')||i.type)+'='+String(i.value).slice(0,14)).join(' '),
    ctrls: interactives(p).map(x=>x.label.slice(0,20)).join(' | ').slice(0,300)} : {none:true}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:NAME}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); return clickDeepest(d,/^\\s*Edit\\s*$/); })()`);
  await page.waitForTimeout(3500);
  out.clickDateBtn = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis); const d=ds[ds.length-1];
    return clickDeepest(d, /^Date and time/); })()`);
  await page.waitForTimeout(2500);
  out.picker = await page.evaluate(topBox);
  return out;
};
