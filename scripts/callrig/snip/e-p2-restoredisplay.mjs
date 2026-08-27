import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const st = `(() => { const h=document.documentElement;
  return h.getAttribute('data-theme')+'/'+h.getAttribute('data-density'); })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.before = await page.evaluate(st);
  await page.keyboard.press('Meta+Shift+KeyT');
  await page.waitForTimeout(2500);
  out.reset = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? clickDeepest(p, /^Reset all$/) : 'no panel'; })()`);
  await page.waitForTimeout(3000);
  out.afterReset = await page.evaluate(st);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  out.afterReload = await page.evaluate(st);
  return out;
};
