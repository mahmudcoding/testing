// Notice poller: small visible notices only (excludes the full-screen call overlay), volatile text stripped.
export default async ({page}) => {
  const ms=+(process.env.QA_MS||45000), every=300;
  const t0=Date.now(); const seen=new Map(); const stateChanges=[]; let prevKey=null;
  const strip = s => s.replace(/\d+:\d+(:\d+)?/g,'#:#').replace(/\b\d+\s*ms\b/g,'#ms').replace(/\b\d+\b/g,'#');
  while (Date.now()-t0<ms) {
    const s = await page.evaluate(()=>{
      const box = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return null;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return {op,w:Math.round(r.width),h:Math.round(r.height)};};
      const nodes=[...document.querySelectorAll('[data-sonner-toast],[role=alert],[role=status],[role=dialog]')];
      const notices=nodes.map(n=>{const v=box(n); if(!v) return null;
        if (v.w>900 && v.h>700) return null; // the full-screen call overlay
        return {t:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,200), op:v.op, w:v.w, h:v.h, tid:n.dataset.testid||null};}).filter(x=>x&&x.t);
      const visOK = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const rec=[...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/record/i.test(e.innerText)&&visOK(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,80)))];
      return {notices, rec, vs:document.visibilityState};
    });
    for (const n of s.notices) { const k=strip(n.t)+'|'+n.w+'x'+n.h; const p=seen.get(k)||{t:n.t,size:n.w+'x'+n.h,maxOp:0,first:null,last:null,tid:n.tid};
      p.maxOp=Math.max(p.maxOp,n.op); if(p.first===null)p.first=Date.now()-t0; p.last=Date.now()-t0; seen.set(k,p); }
    const key=JSON.stringify([s.rec,s.vs]);
    if(key!==prevKey){ stateChanges.push({ms:Date.now()-t0, rec:s.rec, vs:s.vs}); prevKey=key; }
    await page.waitForTimeout(every);
  }
  return {notices:[...seen.values()].slice(0,25), stateChanges:stateChanges.slice(0,40)};
};
