import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const res = `(() => { ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  return d? (d.innerText||'').replace(/\\n+/g,' | ').slice(0,220) : '(no dialog)'; })()`;
export default async ({page}) => {
  const out={};
  for (const view of ['Week','Month']) {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
      const m=document.querySelector('main'); return clickDeepest(m, new RegExp('^'+${JSON.stringify(view)}+'$')); })()`);
    await page.waitForTimeout(4500);
    out[view+'_header'] = await page.evaluate(`(() => { const m=document.querySelector('main');
      return (m.innerText||'').split('\\n').filter(l=>/20\\d\\d/.test(l))[0]||'?'; })()`);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
      const m=document.querySelector('main'); return clickDeepest(m, /^Search$/); })()`);
    await page.waitForTimeout(2500);
    await page.locator('input[aria-label="Search events"]').first().fill('Monthly');
    await page.waitForTimeout(3500);
    out[view+'_searchMonthly'] = await page.evaluate(res);
    await page.locator('input[aria-label="Search events"]').first().fill('');
    await page.waitForTimeout(600);
    await page.locator('input[aria-label="Search events"]').first().fill('Aug 31');
    await page.waitForTimeout(3500);
    out[view+'_searchByDate'] = await page.evaluate(res);
  }
  return out;
};
