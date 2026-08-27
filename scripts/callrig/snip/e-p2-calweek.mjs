import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const clickLabel = async (page, label) => {
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>(x.innerText||'').trim()===${JSON.stringify(label)});
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t) return false;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(2600); return true;
};
const nav = async (page, dir) => {
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>new RegExp('^'+${JSON.stringify(dir)}+'$','i').test(x.getAttribute('aria-label')||''));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t) return false;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(180);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(2300); return true;
};
const read = `(() => {
   const m=document.querySelector('main');
   const t=(m.innerText||'').replace(/\\s+/g,' ');
   const cols=[...m.querySelectorAll('[data-testid^="week-col-head-"]')]
     .map(e=>e.getAttribute('data-testid').replace('week-col-head-',''));
   const uniq=[...new Set(cols)].sort();
   return {header:(t.match(/\\d{1,2}\\s*–\\s*\\d{1,2}\\s+\\w+\\s+\\d{4}|\\d{1,2}\\s+\\w+\\s*–\\s*\\d{1,2}\\s+\\w+\\s+\\d{4}/)||[''])[0],
           nCols:uniq.length, first:uniq[0], last:uniq[uniq.length-1]}; })()`;
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await clickLabel(page,'Week');
  await page.waitForTimeout(2500);
  const steps=[await page.evaluate(read)];
  for(let i=0;i<20;i++){ if(!await nav(page,'Next')) break; steps.push(await page.evaluate(read)); }
  return {steps: steps.filter((s,i)=> i<3 || i>15 || /January|December/.test(s.header))};
};
