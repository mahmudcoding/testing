// Polls the whole document for visible notices + recording indicators, from before the trigger.
export default async ({page}) => {
  const ms=+(process.env.QA_MS||45000), every=300;
  const t0=Date.now(); const seen=new Map(); const stateChanges=[]; let prevKey=null;
  while (Date.now()-t0<ms) {
    const s = await page.evaluate(()=>{
      const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return {ok:op>0.05,op,w:Math.round(r.width),h:Math.round(r.height)};};
      const nodes=[...document.querySelectorAll('[data-sonner-toast],[role=alert],[role=status],[role=dialog]')];
      const notices=nodes.map(n=>{const v=vis(n); return {t:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,180), op:v.op, w:v.w, h:v.h, tid:n.dataset.testid||null};}).filter(x=>x.t);
      // recording-ish text anywhere visible
      const rec=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/record/i.test(e.innerText)&&vis(e).ok)
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,80));
      return {notices, rec:[...new Set(rec)], vs:document.visibilityState};
    });
    for (const n of s.notices) { const k=n.t+'|'+n.w+'x'+n.h; const p=seen.get(k)||{t:n.t,size:n.w+'x'+n.h,maxOp:0,first:null,last:null,tid:n.tid};
      p.maxOp=Math.max(p.maxOp,n.op); if(p.first===null)p.first=Date.now()-t0; p.last=Date.now()-t0; seen.set(k,p); }
    const key=JSON.stringify([s.rec,s.vs]);
    if(key!==prevKey){ stateChanges.push({ms:Date.now()-t0, rec:s.rec, vs:s.vs}); prevKey=key; }
    await page.waitForTimeout(every);
  }
  return {notices:[...seen.values()], stateChanges};
};
