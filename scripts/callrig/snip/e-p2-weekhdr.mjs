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
const nav = async (page) => {
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/^Next$/i.test(x.getAttribute('aria-label')||''));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t) return false;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(180);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(2300); return true;
};
// read the H1 / heading element directly, no regex
const read = `(() => { ${VISFN}
   const m=document.querySelector('main');
   const h=[...m.querySelectorAll('h1,h2,[role=heading]')].filter(vis)[0];
   const cols=[...m.querySelectorAll('[data-testid^="week-col-head-"]')]
     .map(e=>e.getAttribute('data-testid').replace('week-col-head-',''))
     .filter(d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(d));
   const u=[...new Set(cols)].sort();
   return {headingRaw: h?(h.innerText||'').replace(/\\s+/g,' ').trim():'(no heading)',
           firstCol:u[0], lastCol:u[u.length-1], nCols:u.length}; })()`;
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await clickLabel(page,'Week');
  await page.waitForTimeout(2500);
  const out=[];
  for(let i=0;i<19;i++){
    const s = await page.evaluate(read);
    if(/Dec|Jan/i.test(s.headingRaw) || i<1) out.push({i, ...s});
    if(!await nav(page)) break;
  }
  return out;
};
