import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let body=''; try{ body=(await r.text()).slice(0,220);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,60)+' -> '+r.status()+' '+body); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.evaluate(`(() => { ${VISFN}
    const n=[...document.querySelectorAll('button,a')].filter(vis).find(b=>/new meeting/i.test(b.getAttribute('aria-label')||b.textContent||'')); n&&n.click(); })()`);
  await page.waitForTimeout(3000);
  const dlg = page.locator('[role=dialog]').last();
  await dlg.locator('input[aria-label="Add title"]').fill('QA-E RSVP probe');
  await dlg.locator('input[aria-label="Starts time"]').fill('18:00');
  await page.waitForTimeout(600);
  await dlg.locator('input[aria-label="Ends time"]').fill('18:30');
  await page.waitForTimeout(600);
  // invite QA Bob
  out.pickBob = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const row=[...d.querySelectorAll('button,li,[role=option],div')].filter(vis).find(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()==='QA Bob');
    if(!row) return 'no QA Bob row'; row.click(); return 'clicked <'+row.tagName+'>'; })()`);
  await page.waitForTimeout(1800);
  out.beforeSubmit = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return {selected:(d.innerText.match(/Selected \\(\\d+\\)/)||['none'])[0],
      times:[...d.querySelectorAll('input')].filter(i=>/time|date/i.test(i.getAttribute('aria-label')||'')).map(i=>i.getAttribute('aria-label')+'='+i.value).join(' ')}; })()`);
  writes.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,4);
  out.dialogClosed = await page.evaluate(`(() => { ${boxVisFn} return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length===0; })()`);
  out.chips = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('[data-testid="calendar-event-chip"]')].filter(vis).map(c=>(c.innerText||'').replace(/\\s+/g,' ').slice(0,34)); })()`);
  return out;
};
