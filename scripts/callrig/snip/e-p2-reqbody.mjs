import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const OPT=process.env.QA_OPT||'15 minutes before';
const TITLE=process.env.QA_TITLE||'QA-E Rem payload';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url();
    if (u.includes('/api/v1/calendar/meetings') && r.method()==='POST') {
      let b=''; try{ b=r.postData()||''; }catch(e){}
      reqs.push({url:u.replace(/^https:\/\/[^/]+/,''), body:b}); } });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill(TITLE);
  await page.locator('input[data-field="event-start-time"]').first().fill('22:40');
  await page.waitForTimeout(600);
  await page.locator('input[data-field="event-end-time"]').first().fill('22:55');
  await page.waitForTimeout(900);
  out.pickReminder = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    if(!b) return 'not found'; b.scrollIntoView({block:'center'}); b.click(); return 'opened'; })()`);
  await page.waitForTimeout(2000);
  out.picked = await page.evaluate(`(() => { ${VISFN}
    const o=[...document.querySelectorAll('[role=option]')].filter(vis).find(x=>(x.textContent||'').trim()===${JSON.stringify(OPT)});
    if(!o) return 'option not found'; o.click(); return 'picked'; })()`);
  await page.waitForTimeout(1800);
  out.shownValue = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    return b?(b.textContent||'').trim():'gone'; })()`);
  reqs.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6000);
  out.postRequests = reqs.map(r=>r.url+'\n    BODY: '+(r.body||'(empty)').slice(0,600));
  return out;
};
