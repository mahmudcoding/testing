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
  for(let i=0;i<4;i++){   // Aug -> December 2026 (no chips there)
    const nb = await page.evaluate(`(() => { ${VISFN}
       const c=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
         .find(x=>/^Next$/i.test((x.getAttribute('aria-label')||'')));
       if(!c) return null; const r=c.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(!nb) break;
    await page.mouse.move(nb.cx,nb.cy); await page.waitForTimeout(200);
    await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
    await page.waitForTimeout(2300);
  }
  const target = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const hdr=((m.innerText||'').match(/\\b(January|February|March|April|May|June|July|August|September|October|November|December)\\s+(\\d{4})/)||[]);
     const months={January:1,February:2,March:3,April:4,May:5,June:6,July:7,August:8,September:9,October:10,November:11,December:12};
     const hm=months[hdr[1]], hy=parseInt(hdr[2],10);
     const nums=[...m.querySelectorAll('[data-testid^="month-day-num-"]')];
     const trailing=nums.filter(e=>{const d=e.getAttribute('data-testid').replace('month-day-num-','');
       const [y,mo]=d.split('-').map(Number); return (y>hy)||(y===hy&&mo>hm);});
     const pick=trailing[trailing.length-1]; if(!pick) return {none:true, header:hdr[0], nNums:nums.length};
     const cell=pick.closest('[data-testid="calendar-month-cell"]');
     const r=cell.getBoundingClientRect();
     return {date:pick.getAttribute('data-testid').replace('month-day-num-',''), header:hdr[0],
             nTrailing:trailing.length, cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.target=target;
  if(!target || target.none) return out;
  await page.mouse.move(target.cx,target.cy); await page.waitForTimeout(400);
  await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(boxVis).pop();
     if(!d) return {dialogOpen:false, url:location.pathname};
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); });
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {dialogOpen:true, fields:f, summary:(t.match(/\\w{3}, \\w{3} \\d{1,2}[^|]{0,30}/)||[''])[0],
             head:t.slice(0,64)}; })()`);
  out.startMatchesClicked = !!(out.after.fields && out.after.fields['event-start']===target.date);
  await page.keyboard.press('Escape');
  return out;
};
