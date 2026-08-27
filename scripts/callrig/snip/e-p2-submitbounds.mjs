import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/calendar/meetings')&&m==='POST'){ let b=''; try{b=(await r.text()).slice(0,150);}catch(e){}
      api.push({st:r.status, req:(r.request().postData()||'').slice(0,140), res:b}); }});
  const create = async (title, tag) => {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7500);
    await page.getByRole('button',{name:'New meeting'}).first().click();
    await page.waitForTimeout(3200);
    await page.locator('input[data-field="event-title"]').first().fill(title);
    await page.locator('input[data-field="event-start"]').first().fill('2026-08-29'); await page.waitForTimeout(350);
    await page.locator('input[data-field="event-start-time"]').first().fill('09:00'); await page.waitForTimeout(350);
    await page.locator('input[data-field="event-end"]').first().fill('2026-08-29'); await page.waitForTimeout(350);
    await page.locator('input[data-field="event-end-time"]').first().fill('09:30'); await page.waitForTimeout(700);
    api.length=0;
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       clickDeepest(d, /^Schedule meeting$/); })()`);
    await page.waitForTimeout(7000);
    const still = await page.evaluate(`(() => { ${boxVisFn}
       return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length>0; })()`);
    const notice = await page.evaluate(`(() => { ${VISFN}
       const strict=el=>{const r=el.getBoundingClientRect(); return r.width>=24&&r.height>=12 && vis(el);};
       return [...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strict)
         .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,2); })()`);
    return {tag, request:api[0]||null, dialogStillOpen:still, notice};
  };
  out.whitespace = await create('     ','whitespace-only title');
  out.long = await create('Q'.repeat(500),'500-char title');
  // how do the chips render?
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.chips = await page.evaluate(`(() => { ${VISFN}
     const cs=[...document.querySelectorAll('[data-testid="calendar-event-chip"]')].filter(vis);
     const odd=cs.filter(c=>/QQQQ/.test(c.innerText||'')||((c.innerText||'').replace(/\\s+/g,'').length<6));
     return odd.slice(0,3).map(c=>{ const r=c.getBoundingClientRect();
       return { text:(c.innerText||'').replace(/\\s+/g,' ').slice(0,60),
                w:Math.round(r.width), h:Math.round(r.height),
                overflowX: c.scrollWidth>c.clientWidth && c.clientWidth>=24,
                pastViewport: r.left>=innerWidth || r.right<=0 }; }); })()`);
  return out;
};
