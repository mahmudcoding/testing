import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  out.clickSettings = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Meeting settings$/); })()`);
  await page.waitForTimeout(2500);
  out.panel = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis); const d=ds[ds.length-1];
    if(!d) return 'none';
    return {n:ds.length, text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,520),
      ctrls: interactives(d).map(x=>x.label.slice(0,26)+(x.disabled?'[D]':'')).join(' | ').slice(0,420)}; })()`);
  return out;
};
