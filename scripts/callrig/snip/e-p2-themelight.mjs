import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.keyboard.press('Meta+Shift+KeyT');
  await page.waitForTimeout(2500);
  const r = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? clickDeepest(p, /^Light$/) : 'no panel'; })()`);
  await page.waitForTimeout(2500);
  const after = await page.evaluate(`(() => document.documentElement.getAttribute('data-theme')+'/'+document.documentElement.getAttribute('data-density'))()`);
  await page.keyboard.press('Escape');
  return {click:r, state:after};
};
