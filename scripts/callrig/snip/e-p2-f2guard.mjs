import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const calls=[];
  page.on('response', async r => { const u=r.url();
    if(/respond/.test(u)&&r.request().method()!=='GET'){ let b=''; try{b=(await r.text()).slice(0,90);}catch(e){}
      calls.push(r.status()+' '+(r.request().postData()||'')+' :: '+b.replace(/\s+/g,' ')); }});
  const openFromGrid = async () => {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       clickDeepest(document.querySelector('main'), /^Month$/); })()`);
    await page.waitForTimeout(5500);
    const t = await page.evaluate(`(() => { ${VISFN}
       const c=[...document.querySelectorAll('[data-testid="calendar-month-event-chip"]')].filter(vis)
         .find(x=>/RESCHEDULED/i.test(x.textContent||''));
       if(!c) return {none:true}; const r=c.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return false;
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
    await page.waitForTimeout(5000); return true;
  };
  const rsvpState = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return {none:true};
     return [...d.querySelectorAll('button')].filter(vis)
       .filter(b=>/^(Yes|No)$/.test((b.textContent||'').trim()))
       .map(b=>(b.textContent||'').trim()+'/disabled='+b.disabled+'/pressed='+b.getAttribute('aria-pressed')); })()`;
  out.opened = await openFromGrid();
  if(!out.opened){ out.err='chip not found'; return out; }
  out.before = await page.evaluate(rsvpState);
  calls.length=0;
  out.clickNo = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /^No$/); })()`);
  await page.waitForTimeout(6000);
  out.calls = calls.slice(0,2);
  out.afterClick = await page.evaluate(rsvpState);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  out.reopened = await openFromGrid();
  out.afterReload = await page.evaluate(rsvpState);
  // restore to accepted
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(d) clickDeepest(d, /^Yes$/); })()`);
  await page.waitForTimeout(5000);
  out.restored = await page.evaluate(rsvpState);
  return out;
};
