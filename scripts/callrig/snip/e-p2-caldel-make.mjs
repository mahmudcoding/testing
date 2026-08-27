import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,200);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,50)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E Delete probe');
  await page.locator('input[data-field="event-start-time"]').first().fill('23:00');
  await page.waitForTimeout(500);
  await page.locator('input[data-field="event-end-time"]').first().fill('23:30');
  await page.waitForTimeout(600);
  const sm=page.locator('input[placeholder="Search members"]').first();
  await sm.scrollIntoViewIfNeeded(); await sm.fill('Bob');
  await page.waitForTimeout(2000);
  out.pick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); return clickDeepest(d,/QA Bob/); })()`);
  await page.waitForTimeout(1800);
  out.selected = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return ((d.innerText||'').match(/Selected \\(\\d+\\)/)||['none'])[0]; })()`);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,2);
  return out;
};
