import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const tile = await page.evaluate(`(() => { ${VISFN}
    const t=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
      .find(b=>/\\.(png|txt)/i.test(b.getAttribute('aria-label')||b.textContent||''));
    const r=t.getBoundingClientRect();
    return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.click(tile.cx, tile.cy, {button:'right'}); await page.waitForTimeout(2000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('[role=menu]')||document.body, /View details/i); })()`);
  await page.waitForTimeout(4500);
  // poller with a STRICTER visibility test (sr-only uses 1px boxes)
  await page.evaluate(`(() => {
    if(window.__fbTimer) clearInterval(window.__fbTimer);
    window.__fb=[]; window.__clip=[]; const t0=performance.now();
    if(navigator.clipboard){ const o=navigator.clipboard.writeText?.bind(navigator.clipboard);
      navigator.clipboard.writeText=async t=>{ window.__clip.push(String(t)); try{return o?await o(t):undefined;}catch(e){return undefined;} }; }
    const vis=el=>{const r=el.getBoundingClientRect(); if(r.width<24||r.height<12) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01;};
    window.__fbTimer=setInterval(()=>{
      const btn=[...document.querySelectorAll('button')].filter(vis)
        .find(b=>/^(copy link|copied|link copied)/i.test((b.textContent||'').trim()));
      const notes=[...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast],[role=tooltip]')]
        .filter(vis).map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      window.__fb.push({t:Math.round(performance.now()-t0), btn: btn?(btn.textContent||'').trim().slice(0,22):null, notes});
    },120); })()`);
  await page.waitForTimeout(1000);
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     return clickDeepest(c.pop()||document.body, /^Copy link$/); })()`);
  await page.waitForTimeout(7000);
  out.tl = await page.evaluate(`(() => { clearInterval(window.__fbTimer);
    const p=window.__fb||[]; const u=[]; let last='';
    for(const s of p){ const k=JSON.stringify([s.btn,s.notes]); if(k!==last){ u.push(s); last=k; } }
    return {samples:p.length, distinct:u.length, changes:u.slice(0,8), clip:(window.__clip||[]).length}; })()`);
  return out;
};
