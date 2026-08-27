import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.cellNames = await page.evaluate(`(() => {
    const b=[...document.querySelectorAll('button')].filter(x=>/^Create event /.test(x.getAttribute('aria-label')||''));
    const labels=b.map(x=>x.getAttribute('aria-label'));
    const days=[...new Set(labels.map(l=>l.split(' at ')[0].replace('Create event ','')))];
    return {count:b.length, days, first3:labels.slice(0,3), last3:labels.slice(-3)}; })()`);
  // click a Wednesday 23:00 cell (today, future)
  const target = page.locator('button[aria-label="Create event Wednesday at 23:00"]');
  out.targetCount = await target.count();
  if (!out.targetCount) {
    out.altNames = await page.evaluate(`(() => [...document.querySelectorAll('button')].map(x=>x.getAttribute('aria-label')).filter(l=>l&&/Wednesday at 2/.test(l)))()`);
  } else {
    await target.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await target.first().click();
    await page.waitForTimeout(3500);
    out.dialogAfterCellClick = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
      const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
      if(!d) return {none:true};
      return {title:(d.innerText||'').split('\\n')[0],
        fields:[...d.querySelectorAll('input')].filter(i=>/date|time/.test(i.getAttribute('data-field')||'')).map(i=>i.getAttribute('data-field')+'='+i.value).join(' '),
        summary:(d.innerText||'').replace(/\\n+/g,' | ').slice(-110)}; })()`);
  }
  return out;
};
