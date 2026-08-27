import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const st = `(() => { const h=document.documentElement;
  return {theme:h.getAttribute('data-theme'), density:h.getAttribute('data-density'),
    bodyBg:getComputedStyle(document.body).backgroundColor,
    rowH:getComputedStyle(h).getPropertyValue('--density-row').trim()}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.a_before = await page.evaluate(st);
  await page.keyboard.press('Meta+Shift+KeyT');
  await page.waitForTimeout(2500);
  out.panelCtrls = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? interactives(p).map(x=>x.label.slice(0,20)+(x.disabled?'[D]':'')).join(' | ').slice(0,300) : 'no panel'; })()`);
  out.pickDark = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? clickDeepest(p, /^Dark$/) : 'no panel'; })()`);
  await page.waitForTimeout(2500);
  out.b_afterDark = await page.evaluate(st);
  out.pickCompact = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? clickDeepest(p, /^Compact$/) : 'no panel'; })()`);
  await page.waitForTimeout(2500);
  out.c_afterCompact = await page.evaluate(st);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  out.d_afterReload = await page.evaluate(st);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(5500);
  out.e_otherRoute = await page.evaluate(st);
  return out;
};
