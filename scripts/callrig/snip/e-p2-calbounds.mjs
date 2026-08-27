import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', async r => { if(r.url().includes('/api/v1/calendar/meetings')&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,110);}catch(e){}
    posts.push({st:r.status, req:(r.request().postData()||'').slice(0,150), res:b.replace(/\s+/g,' ')}); }});
  const attempt = async (label, sd, st, ed, et) => {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8000);
    await page.getByRole('button',{name:'New meeting'}).first().click();
    await page.waitForTimeout(3300);
    await page.locator('input[data-field="event-title"]').first().fill('QA-E bound '+label);
    await page.locator('input[data-field="event-start"]').first().fill(sd); await page.waitForTimeout(320);
    await page.locator('input[data-field="event-start-time"]').first().fill(st); await page.waitForTimeout(320);
    await page.locator('input[data-field="event-end"]').first().fill(ed); await page.waitForTimeout(320);
    await page.locator('input[data-field="event-end-time"]').first().fill(et); await page.waitForTimeout(900);
    const summary = await page.evaluate(`(() => { ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const t=(d.innerText||'').replace(/\\s+/g,' ');
       const m=t.match(/\\w{3}, \\w{3} \\d{1,2} ·[^·]*·[^A-Za-z]*\\w+/); return m?m[0].slice(0,60):'(no summary)'; })()`);
    posts.length=0;
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       clickDeepest(d, /^Schedule meeting$/); })()`);
    await page.waitForTimeout(7000);
    const still = await page.evaluate(`(() => { ${boxVisFn}
       return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length>0; })()`);
    const notice = await page.evaluate(`(() => { ${VISFN}
       const strict=el=>{const r=el.getBoundingClientRect(); return r.width>=24&&r.height>=12&&vis(el);};
       return [...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strict)
         .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,2); })()`);
    if(still){ await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
      await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
         const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')].filter(e=>e.getBoundingClientRect().width>80).pop();
         if(d) clickDeepest(d, /^(Discard|Yes|Close)$/); })()`); }
    return {label, summary, post:posts[0]||'(no POST — blocked client-side)', dialogStillOpen:still, notice};
  };
  out.acrossMidnight = await attempt('midnight','2026-09-25','23:30','2026-09-26','00:30');
  out.endBeforeStart = await attempt('reversed','2026-09-25','15:00','2026-09-25','14:00');
  out.pastDate       = await attempt('past','2026-08-01','10:00','2026-08-01','10:30');
  return out;
};
