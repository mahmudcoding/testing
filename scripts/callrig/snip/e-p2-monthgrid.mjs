import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.weekChips = await page.evaluate(`(() => { ${VISFN}
     return {testid:[...document.querySelectorAll('[data-testid="calendar-event-chip"]')].length,
             visible:[...document.querySelectorAll('[data-testid="calendar-event-chip"]')].filter(vis).length}; })()`);
  out.switch = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     return clickDeepest(document.querySelector('main'), /^Month$/); })()`);
  await page.waitForTimeout(6000);
  out.viewNow = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const btns=[...m.querySelectorAll('button')].filter(vis)
       .filter(b=>/^(Day|Week|Month)$/.test((b.textContent||'').trim()))
       .map(b=>(b.textContent||'').trim()+'/c='+b.getAttribute('aria-checked'));
     return {viewButtons:btns, header:((m.innerText||'').replace(/\\s+/g,' ').slice(0,60))}; })()`);
  out.monthMarkup = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     // what carries event titles in this view?
     const withTitle=[...m.querySelectorAll('*')].filter(e=>e.children.length===0 && vis(e))
       .filter(e=>/QA-E|Daily standup|RESCHEDULED/.test(e.textContent||''));
     const sample=withTitle.slice(0,4).map(e=>{
       let p=e, chain=[];
       for(let i=0;i<4&&p;i++){ chain.push(p.tagName+(p.getAttribute('data-testid')?('[testid='+p.getAttribute('data-testid')+']'):'')
          +(p.className?('.'+String(p.className).split(' ')[0].slice(0,18)):'')); p=p.parentElement; }
       return {txt:(e.textContent||'').trim().slice(0,26), chain:chain.join(' < ')};
     });
     const testids=[...new Set([...m.querySelectorAll('[data-testid]')].filter(vis)
       .map(e=>e.getAttribute('data-testid')))].slice(0,10);
     return {titleNodes:withTitle.length, sample, visibleTestids:testids}; })()`);
  return out;
};
