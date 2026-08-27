import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const NAME='QA-E Delete probe';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,160);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,52)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:NAME}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  out.clickDelete = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); return clickDeepest(d,/^\\s*Delete\\s*$/); })()`);
  await page.waitForTimeout(2500);
  out.confirmUI = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis).pop();
    return d? {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(-250), ctrls: interactives(d).map(x=>x.label.slice(0,24)).join(' | ').slice(-200)}:'none'; })()`);
  writes.length=0;
  out.confirm = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^(Delete|Delete meeting|Cancel meeting|Confirm)$/i); })()`);
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,3);
  out.chipsAfter = await page.evaluate(`(() => [...document.querySelectorAll('[data-testid="calendar-event-chip"]')].map(c=>(c.innerText||'').replace(/\\s+/g,' ').slice(0,32)))()`);
  return out;
};
