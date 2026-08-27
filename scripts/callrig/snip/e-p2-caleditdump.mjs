import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const NAME='QA-E RSVP probe';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:NAME}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  out.cardCtrls = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? interactives(d).map(x=>x.label.slice(0,20)+(x.disabled?'[D]':'')).join(' | ') : 'none'; })()`);
  out.openEdit = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^\\s*Edit\\s*$/); })()`);
  await page.waitForTimeout(3500);
  out.editDialog = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis);
    const d=ds[ds.length-1];
    if(!d) return 'no dialog';
    return {n:ds.length, title:(d.innerText||'').split('\\n')[0],
      inputs:[...d.querySelectorAll('input,textarea,select')].map((i,ix)=>ix+' <'+i.tagName+'> '+[...i.attributes].map(a=>a.name+'="'+a.value.slice(0,22)+'"').join(' ').slice(0,150)),
      buttons: interactives(d).filter(x=>x.tag==='BUTTON').map(x=>x.label.slice(0,20)+(x.disabled?'[D]':'')).join(' | ').slice(0,300)}; })()`);
  return out;
};
