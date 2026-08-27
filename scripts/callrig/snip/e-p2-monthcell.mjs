import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(300); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(180);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(1500); return true; };
const boxVis = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await mc(page, page.locator('main button').filter({hasText:/^Month$/}).last());
  await page.waitForTimeout(2500);
  out.header = await page.evaluate(`(() => (document.querySelector('main').innerText||'').replace(/\\s+/g,' ')
     .match(/\\b(January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4}/)||[''])()[0]`).catch(()=>null);
  // pick a TRAILING cell: a day-number testid whose month differs from the header month
  const target = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const hdr=((m.innerText||'').match(/\\b(January|February|March|April|May|June|July|August|September|October|November|December)\\s+(\\d{4})/)||[]);
     const months={January:1,February:2,March:3,April:4,May:5,June:6,July:7,August:8,September:9,October:10,November:11,December:12};
     const hm=months[hdr[1]], hy=parseInt(hdr[2],10);
     const nums=[...m.querySelectorAll('[data-testid^="month-day-num-"]')];
     const trailing=nums.filter(e=>{const d=e.getAttribute('data-testid').replace('month-day-num-','');
       const [y,mo]=d.split('-').map(Number); return !(y===hy&&mo===hm);});
     if(!trailing.length) return null;
     const pick=trailing[trailing.length-1];   // last trailing day = deepest into the NEXT month
     const cell=pick.closest('[data-testid="calendar-month-cell"]')||pick;
     const r=cell.getBoundingClientRect();
     return {date:pick.getAttribute('data-testid').replace('month-day-num-',''),
             headerMonth:hdr[0], cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.target = target;
  if(!target) return out;
  await page.mouse.move(target.cx,target.cy); await page.waitForTimeout(400);
  await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
  await page.waitForTimeout(4000);
  out.afterClick = await page.evaluate(`(() => { ${boxVis} ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis).pop();
     if(!d) return {dialogOpen:false, url:location.pathname};
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); });
     return {dialogOpen:true, fields:f,
             head:(d.innerText||'').replace(/\\s+/g,' ').slice(0,90)}; })()`);
  out.matches = out.afterClick.fields && out.afterClick.fields['event-start']===target.date;
  await page.keyboard.press('Escape');
  return out;
};
