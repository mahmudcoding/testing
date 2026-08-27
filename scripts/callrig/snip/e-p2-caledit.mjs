import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const NAME='QA-E RSVP probe';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const chips = `(() => [...document.querySelectorAll('[data-testid="calendar-event-chip"]')].map(c=>(c.innerText||'').replace(/\\s+/g,' ').slice(0,40)))()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,180);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,58)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.chipsBefore = (await page.evaluate(chips)).filter(c=>/RSVP probe/.test(c));
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:NAME}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  out.openEdit = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^\\s*Edit\\s*$/); })()`);
  await page.waitForTimeout(3000);
  out.editForm = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    if(!d) return 'no dialog';
    return {title:(d.innerText||'').split('\\n')[0],
      fields:[...d.querySelectorAll('input')].filter(i=>i.getAttribute('data-field')).map(i=>i.getAttribute('data-field')+'='+i.value).join(' ')}; })()`);
  // change the start time
  await page.locator('input[data-field="event-start-time"]').first().fill('18:45');
  await page.waitForTimeout(600);
  await page.locator('input[data-field="event-end-time"]').first().fill('19:15');
  await page.waitForTimeout(800);
  writes.length=0;
  out.saveClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^\\s*(Save|Save changes|Update)\\s*$/); })()`);
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,3);
  out.chipsAfter = (await page.evaluate(chips)).filter(c=>/RSVP probe/.test(c));
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  out.chipsAfterReload = (await page.evaluate(chips)).filter(c=>/RSVP probe/.test(c));
  return out;
};
