import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const OPT=process.env.QA_OPT||'15 minutes before';
const TITLE=process.env.QA_TITLE||'QA-E Rem payload4';
const START=process.env.QA_START||'23:20', END=process.env.QA_END||'23:35';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ if (r.url().includes('/api/v1/calendar/meetings') && r.method()==='POST') {
    let b=''; try{ b=r.postData()||''; }catch(e){} reqs.push(b); } });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill(TITLE);
  await page.locator('input[data-field="event-start-time"]').first().fill(START);
  await page.waitForTimeout(600);
  await page.locator('input[data-field="event-end-time"]').first().fill(END);
  await page.waitForTimeout(900);
  // exact flow that worked before: find button, click, wait, click option, wait
  await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    if(b){ b.scrollIntoView({block:'center'}); } })()`);
  await page.waitForTimeout(900);
  await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    if(b) b.click(); })()`);
  await page.waitForTimeout(2200);
  out.picked = await page.evaluate(`(() => { ${VISFN}
    const o=[...document.querySelectorAll('[role=option]')].filter(vis).find(x=>(x.textContent||'').trim()===${JSON.stringify(OPT)});
    if(!o) return 'not found'; o.click(); return 'clicked'; })()`);
  await page.waitForTimeout(2000);
  out.shownValue = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    if(!d) return 'DIALOG GONE';
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    return b?(b.textContent||'').trim():'gone'; })()`);
  reqs.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6500);
  out.postBody = reqs[0]||'(no POST captured)';
  out.mentionsReminder = /remind|notify|alert/i.test(out.postBody);
  out.bodyKeys = (()=>{ try{ return Object.keys(JSON.parse(out.postBody)).join(','); }catch(e){ return '(unparsed)'; } })();
  return out;
};
