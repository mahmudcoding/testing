import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    return clickDeepest(document.body, /^Search in channel$/); })()`);
  await page.waitForTimeout(3500);
  out.urlAfter = page.url().replace(/^https:\/\/[^/]+/,'');
  out.surface = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const m=document.querySelector('main');
    const root=d||m;
    return {dialogOpen:!!d,
      text:(root.innerText||'').replace(/\\n+/g,' | ').slice(0,300),
      visibleInputs:[...root.querySelectorAll('input,textarea')].filter(vis)
        .map(i=>'<'+i.tagName+' type='+(i.type||'?')+'> ph="'+(i.getAttribute('placeholder')||'')+'" al="'+(i.getAttribute('aria-label')||'')+'"')}; })()`);
  return out;
};
