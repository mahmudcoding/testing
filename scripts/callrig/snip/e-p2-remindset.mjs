import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const START=process.env.QA_START||'18:20', END=process.env.QA_END||'18:35';
const OPT=process.env.QA_OPT||'5 minutes before';
const TITLE=process.env.QA_TITLE||'QA-E Reminder fire test';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/calendar')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,400);}catch(e){}
    writes.push(r.request().method()+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill(TITLE);
  await page.locator('input[data-field="event-start-time"]').first().fill(START);
  await page.waitForTimeout(600);
  await page.locator('input[data-field="event-end-time"]').first().fill(END);
  await page.waitForTimeout(900);
  // find the reminder listbox button (labelled by its current value)
  out.reminderBtn = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    if(!b) return 'not found';
    b.scrollIntoView({block:'center'});
    const r=b.getBoundingClientRect();
    return {text:(b.textContent||'').trim(), haspopup:b.getAttribute('aria-haspopup'),
      expanded:b.getAttribute('aria-expanded'), rect:Math.round(r.x)+','+Math.round(r.y), vis:vis(b)}; })()`);
  await page.waitForTimeout(900);
  out.opened = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    if(!b) return 'not found'; b.click();
    return 'clicked, expanded='+b.getAttribute('aria-expanded'); })()`);
  await page.waitForTimeout(2200);
  out.options = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('[role=option]')].filter(vis).map(o=>(o.textContent||'').trim()); })()`);
  out.picked = await page.evaluate(`(() => { ${VISFN}
    const o=[...document.querySelectorAll('[role=option]')].filter(vis).find(x=>(x.textContent||'').trim()===${JSON.stringify(OPT)});
    if(!o) return 'option not found'; o.click(); return 'picked ${OPT}'; })()`);
  await page.waitForTimeout(2000);
  out.afterPick = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    return b? (b.textContent||'').trim() : 'gone'; })()`);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,1);
  return out;
};
