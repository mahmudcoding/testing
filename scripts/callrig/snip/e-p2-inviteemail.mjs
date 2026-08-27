import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'QA-E RSVP three'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  out.open = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Invite by email$/); })()`);
  await page.waitForTimeout(2800);
  out.surface = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis); const d=ds[ds.length-1];
    return d? {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,300),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>'ph="'+(i.getAttribute('placeholder')||'')+'" type='+i.type),
      ctrls: interactives(d).map(x=>x.label.slice(0,24)+(x.disabled?'[D]':'')).join(' | ').slice(0,240)} : 'none'; })()`);
  return out;
};
