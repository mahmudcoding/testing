import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const fields = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return {closed:true};
  return {all:[...d.querySelectorAll('input')].filter(i=>/event-(start|end)/.test(i.getAttribute('data-field')||''))
    .map(i=>{const r=i.getBoundingClientRect();
      return i.getAttribute('data-field')+' val='+i.value+' vis='+vis(i)+' disabled='+i.disabled
        +' readonly='+i.readOnly+' rect='+Math.round(r.width)+'x'+Math.round(r.height); }),
    summary:((d.innerText||'').match(/\\w{3}, \\w{3} \\d+[^\\n|]*/)||[''])[0].trim().slice(0,60)}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-start"]').first().fill('2026-08-30');
  await page.waitForTimeout(600);
  out.beforeToggle = await page.evaluate(fields);
  await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const s=[...d.querySelectorAll('[role=switch]')].filter(vis)[0]; s && s.click(); })()`);
  await page.waitForTimeout(2200);
  out.afterToggle = await page.evaluate(fields);
  // try editing the surviving time field
  const t = page.locator('[role=dialog] input[data-field="event-start-time"]');
  out.startTimeCount = await t.count();
  if (out.startTimeCount) {
    try { await t.first().fill('08:15', {timeout:6000}); out.editAttempt='filled 08:15'; }
    catch(e){ out.editAttempt='ERR '+String(e).replace(/\s+/g,' ').slice(0,90); }
    await page.waitForTimeout(1500);
    out.afterEdit = await page.evaluate(fields);
  }
  return out;
};
