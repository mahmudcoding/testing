import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const snap = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  const root=d||document.querySelector('main');
  const ctrls=interactives(root).map(x=>x.label);
  const scope=ctrls.filter(l=>/remove/i.test(l)&&/#/.test(l));
  const t=(root.innerText||'').replace(/\\n+/g,' ');
  const c=t.match(/All\\s+(\\d+)\\s+Messages\\s+(\\d+)/);
  return {where:d?'dialog':'page', counts:c?'All='+c[1]+' Msg='+c[2]:'?',
    scopeRemoveControls: scope, nControls: ctrls.length,
    controls: ctrls.map(x=>x.slice(0,24)).join(' | ').slice(0,300)}; })()`;
export default async ({page}) => {
  const out={};
  for (const run of [1,2]) {
    await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} return clickDeepest(document.body, /^Search in channel$/); })()`);
    await page.waitForTimeout(3000);
    await page.locator('input[aria-label="Search messages, channels, people, files…"]').first().fill('qelanex7k2');
    await page.waitForTimeout(4000);
    out['run'+run+'_dialog'] = await page.evaluate(snap);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
      const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
      return clickDeepest(d, /open full search/i); })()`);
    await page.waitForTimeout(6000);
    out['run'+run+'_page'] = await page.evaluate(snap);
  }
  return out;
};
