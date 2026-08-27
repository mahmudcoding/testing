import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{ b=(await r.text()).slice(0,300);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,55)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E RSVP two');
  await page.locator('input[data-field="event-start-time"]').first().fill('21:00');
  await page.waitForTimeout(500);
  await page.locator('input[data-field="event-end-time"]').first().fill('21:30');
  await page.waitForTimeout(700);
  const sm = page.locator('input[placeholder="Search members"]').first();
  await sm.scrollIntoViewIfNeeded(); await sm.fill('Bob');
  await page.waitForTimeout(2200);
  out.picked = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const n=[...d.querySelectorAll('button,[role=option],li')].filter(vis).find(x=>/QA Bob/.test(x.textContent||''));
    if(!n) return 'not found'; n.click(); return 'clicked <'+n.tagName+'> "'+(n.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24)+'"'; })()`);
  await page.waitForTimeout(2000);
  out.selectedState = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const m=(d.innerText||'').match(/Selected \\(\\d+\\)[\\s\\S]{0,40}/);
    return m? m[0].replace(/\\n+/g,' ').slice(0,70) : '(no Selected marker) tail='+(d.innerText||'').replace(/\\n+/g,' ').slice(-90); })()`);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6500);
  out.writes = writes.slice(0,3);
  out.dialogClosed = await page.evaluate(`(() => { ${boxVisFn} return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length===0; })()`);
  return out;
};
