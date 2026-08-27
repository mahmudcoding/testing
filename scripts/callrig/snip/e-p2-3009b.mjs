import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<70) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/Open QA Carol's profile/i.test(x.getAttribute('aria-label')||''));
     const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
  await page.waitForTimeout(4500);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog],aside,[class*=popover]')].filter(boxVis).pop();
     clickDeepest(d, /^Share$/); })()`);
  await page.waitForTimeout(3500);
  // install a 200 ms poller BEFORE picking the target
  await page.evaluate(`(() => {
    if(window.__tTimer) clearInterval(window.__tTimer);
    window.__t=[]; const t0=performance.now();
    const strict=el=>{const r=el.getBoundingClientRect(); if(r.width<24||r.height<12) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01;};
    window.__tTimer=setInterval(()=>{
      const n=[...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strict)
        .map(x=>(x.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      window.__t.push({t:Math.round(performance.now()-t0), n});
    },200); })()`);
  await page.waitForTimeout(600);
  out.pick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /qa-general/i); })()`);
  await page.waitForTimeout(9000);
  out.timeline = await page.evaluate(`(() => { clearInterval(window.__tTimer);
    const p=window.__t||[]; const u=[]; let last='';
    for(const s of p){ const k=JSON.stringify(s.n); if(k!==last){ u.push(s); last=k; } }
    return {samples:p.length, changes:u.slice(0,8),
            bothAtOnce: p.some(s=>s.n.length>1 && s.n.some(x=>/not supported yet/i.test(x)) && s.n.some(x=>/Could not share/i.test(x)))}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
