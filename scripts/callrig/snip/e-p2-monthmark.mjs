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
  await page.waitForTimeout(2800); return true;
};
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await clickLabel(page,'Month');
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const nums=[...m.querySelectorAll('[data-testid^="month-day-num-"]')];
     // compare the day-number elements for the 26th and 27th: any styling difference marks "today"
     const pick=d=>nums.find(e=>e.getAttribute('data-testid')==='month-day-num-'+d);
     const numInfo=e=>{ if(!e) return null; const cs=getComputedStyle(e);
       return {cls:(e.className||'').toString().slice(0,60), color:cs.color, bg:cs.backgroundColor,
               weight:cs.fontWeight, ariaCurrent:e.getAttribute('aria-current'),
               parentCls:(e.parentElement&&e.parentElement.className||'').toString().slice(0,60)}; };
     const a=pick('2026-08-26'), b=pick('2026-08-27');
     // also: any element anywhere in main whose computed style differs and which sits in one of these cells
     const cell=d=>{const n=pick(d); return n?n.closest('[data-testid="calendar-month-cell"]'):null;};
     const cellInfo=c=>{ if(!c) return null; const cs=getComputedStyle(c);
       return {cls:(c.className||'').toString().slice(0,70), bg:cs.backgroundColor,
               outline:cs.outlineColor+' '+cs.outlineWidth, border:cs.borderColor}; };
     return {d26:numInfo(a), d27:numInfo(b),
             cell26:cellInfo(cell('2026-08-26')), cell27:cellInfo(cell('2026-08-27')),
             identicalNums: JSON.stringify(numInfo(a))===JSON.stringify(numInfo(b)),
             identicalCells: JSON.stringify(cellInfo(cell('2026-08-26')))===JSON.stringify(cellInfo(cell('2026-08-27')))}; })()`);
};
