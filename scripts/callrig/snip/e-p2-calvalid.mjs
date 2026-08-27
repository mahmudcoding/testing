import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const state = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return {closed:true};
  const sub=[...d.querySelectorAll('button')].find(b=>/^Schedule meeting$/.test((b.textContent||'').trim()));
  const txt=(d.innerText||'').replace(/\\n+/g,' | ');
  return { submitDisabled: sub? sub.disabled : null,
    errorish: (txt.match(/[^|]*(?:must|invalid|error|cannot|required|future|before|after)[^|]*/i)||[''])[0].trim().slice(0,110),
    summary: (txt.match(/\\w{3}, \\w{3} \\d+[^|]*/)||[''])[0].trim().slice(0,70),
    times: [...d.querySelectorAll('input')].filter(i=>/event-(start|end)/.test(i.getAttribute('data-field')||'')).map(i=>i.getAttribute('data-field')+'='+i.value).join(' ') }; })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/calendar')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,180);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,40)+' -> '+r.status()+' '+b); }});
  const cases = [
    ['endBeforeStart',  {sd:'2026-08-27', st:'14:00', ed:'2026-08-27', et:'13:00'}],
    ['endEqualsStart',  {sd:'2026-08-27', st:'14:00', ed:'2026-08-27', et:'14:00'}],
    ['startInPast',     {sd:'2026-08-20', st:'10:00', ed:'2026-08-20', et:'10:30'}],
    ['endNextDay',      {sd:'2026-08-27', st:'23:30', ed:'2026-08-28', et:'00:30'}],
  ];
  for (const [tag, c] of cases) {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    await page.getByRole('button',{name:'New meeting'}).first().click();
    await page.waitForTimeout(2800);
    await page.locator('input[data-field="event-title"]').first().fill('QA-E VAL '+tag);
    await page.locator('input[data-field="event-start"]').first().fill(c.sd);
    await page.waitForTimeout(400);
    await page.locator('input[data-field="event-start-time"]').first().fill(c.st);
    await page.waitForTimeout(400);
    await page.locator('input[data-field="event-end"]').first().fill(c.ed);
    await page.waitForTimeout(400);
    await page.locator('input[data-field="event-end-time"]').first().fill(c.et);
    await page.waitForTimeout(1500);
    const before = await page.evaluate(state);
    writes.length=0;
    let submitted='not attempted';
    if (before.submitDisabled === false) {
      await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
      await page.waitForTimeout(4500);
      submitted = 'clicked';
    }
    out[tag] = {before, submitted, after: await page.evaluate(state), writes: writes.slice(0,2)};
    await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  }
  return out;
};
