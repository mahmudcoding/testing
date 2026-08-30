export default async ({page}) => {
  const ms=+(process.env.QA_MS||40000), every=250;
  const t0=Date.now(); const seen=new Map(); let samples=0;
  while(Date.now()-t0<ms){
    samples++;
    const s = await page.evaluate(()=>{
      const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return {ok:op>0.05,op};};
      // any visible node whose text is a single emoji-ish glyph, plus anything with reaction in its testid
      const byTid=[...document.querySelectorAll('[data-testid*="reaction"]')].map(e=>{const r=e.getBoundingClientRect();const v=vis(e);
        return {k:'tid:'+e.dataset.testid, t:(e.innerText||'').trim().slice(0,6), op:v.op, x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};});
      const glyphs=[...document.querySelectorAll('div,span')].filter(e=>e.children.length===0 && /^[\p{Extended_Pictographic}‍️]{1,3}$/u.test((e.innerText||'').trim()) && vis(e).ok)
        .map(e=>{const r=e.getBoundingClientRect();const v=vis(e);
          return {k:'glyph', t:e.innerText.trim(), op:v.op, x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};});
      return [...byTid,...glyphs];
    });
    for(const n of s){ const key=n.k+'|'+n.t+'|'+n.w+'x'+n.h; const p=seen.get(key)||{...n,maxOp:0,first:null,last:null,positions:new Set()};
      p.maxOp=Math.max(p.maxOp,n.op); if(p.first===null)p.first=Date.now()-t0; p.last=Date.now()-t0; p.positions.add(n.x+','+n.y); seen.set(key,p); }
    await page.waitForTimeout(every);
  }
  const dur=Date.now()-t0;
  return {health:{samples,durMs:dur,effectiveIntervalMs:Math.round(dur/samples)},
    items:[...seen.values()].map(p=>({k:p.k,t:p.t,maxOp:p.maxOp,firstMs:p.first,lastMs:p.last,size:p.w+'x'+p.h,nPos:p.positions.size,pos:[...p.positions].slice(0,3)}))};
};
