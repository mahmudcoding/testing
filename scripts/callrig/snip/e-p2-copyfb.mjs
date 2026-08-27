import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files?file='+process.env.QA_FID, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { window.__clip=[];
     if(navigator.clipboard){ const o=navigator.clipboard.writeText?.bind(navigator.clipboard);
       navigator.clipboard.writeText=async t=>{ window.__clip.push(String(t)); try{return o?await o(t):undefined;}catch(e){return undefined;} }; } })()`);
  // install a 120 ms poller that records the button label + any visible notice, starting BEFORE the click
  await page.evaluate(`(() => {
    if(window.__fbTimer) clearInterval(window.__fbTimer);
    window.__fb=[]; const t0=performance.now();
    const vis=el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01;};
    window.__fbTimer=setInterval(()=>{
      const btn=[...document.querySelectorAll('button')].filter(vis)
        .find(b=>/copy|copied/i.test((b.textContent||'')+(b.getAttribute('aria-label')||'')));
      const notes=[...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast],[role=tooltip]')]
        .filter(vis).map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      window.__fb.push({t:Math.round(performance.now()-t0),
        btn: btn? (btn.textContent||'').trim().slice(0,24):null, notes});
      if(window.__fb.length>200) window.__fbTimer&&clearInterval(window.__fbTimer);
    },120); })()`);
  await page.waitForTimeout(900);
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     return clickDeepest(c.pop()||document.body, /^Copy link$/); })()`);
  await page.waitForTimeout(7000);
  out.timeline = await page.evaluate(`(() => { clearInterval(window.__fbTimer);
    const p=window.__fb||[]; const uniq=[]; let last='';
    for(const s of p){ const k=JSON.stringify([s.btn,s.notes]); if(k!==last){ uniq.push(s); last=k; } }
    return {samples:p.length, distinct:uniq.length, changes:uniq.slice(0,8),
            clip:(window.__clip||[]).slice(0,1)}; })()`);
  return out;
};
