import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const NAME='QA-E RSVP three';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const card = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return 'NO CARD';
  return {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,300),
    yesno:[...d.querySelectorAll('button')].filter(vis).filter(b=>/^(Yes|No)$/.test((b.textContent||'').trim()))
      .map(b=>(b.textContent||'').trim()+(b.disabled?':DIS':':en')+':pressed='+b.getAttribute('aria-pressed')).join(' ')}; })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,200);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,60)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:NAME}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  out.before = await page.evaluate(card);
  writes.length=0;
  out.clickYes = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^\\s*Yes\\s*$/); })()`);
  await page.waitForTimeout(5000);
  out.writes = writes.slice(0,3);
  out.after = await page.evaluate(card);
  // reload via the grid and re-open to confirm persistence
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip2=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:NAME}).first();
  await chip2.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip2.click();
  await page.waitForTimeout(4500);
  out.afterReload = await page.evaluate(card);
  return out;
};
