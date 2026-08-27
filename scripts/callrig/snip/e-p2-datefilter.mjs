import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const chipState = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return 'no dialog';
  return [...d.querySelectorAll('button')].filter(vis)
    .filter(b=>/Last 7 days|Last 30 days|All time|Relevance/.test((b.textContent||'').trim()))
    .map(b=>(b.textContent||'').trim()+' pressed='+(b.getAttribute('aria-pressed')??'-')
      +' state='+(b.getAttribute('data-state')||'-')+' sel='+(b.getAttribute('aria-selected')??'-')
      +' cls='+String(b.className||'').split(' ').filter(c=>/bg-|border-|text-accent|ring/.test(c)).join('.').slice(0,50)).join('\\n'); })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.locator('button[aria-label^="Search "]').first().click();
  await page.waitForTimeout(2200);
  await page.locator('[role=dialog] input, input[type=search]').first().fill('probe');
  await page.waitForTimeout(3000);
  out.initial = await page.evaluate(chipState);
  for (const f of ['Last 7 days','Last 30 days']) {
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
      const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
      return clickDeepest(d, new RegExp(${JSON.stringify(f)}.replace(/ /g,'\\\\s+'))); })()`);
    await page.waitForTimeout(2500);
    out['after_'+f.replace(/\W+/g,'_')] = await page.evaluate(chipState);
  }
  return out;
};
