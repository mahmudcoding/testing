export default async ({page}) => {
  const ms=+(process.env.QA_MS||45000), every=300;
  const t0=Date.now(); const changes=[]; let prev=null; const seen=new Map();
  const strip=s=>s.replace(/\d+:\d+(:\d+)?/g,'#:#').replace(/\b\d+\s*ms\b/g,'#ms');
  while(Date.now()-t0<ms){
    const s = await page.evaluate(()=>{
      const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const b=document.querySelector('[data-testid="call-controls-screen-share"]');
      const nodes=[...document.querySelectorAll('[data-sonner-toast],[role=alert],[role=status]')].filter(vis)
        .map(n=>{const r=n.getBoundingClientRect(); return {t:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,140), w:Math.round(r.width),h:Math.round(r.height)};}).filter(x=>x.t);
      const inline=[...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/den|reject|declin|not allow|refus|request/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,90)))];
      return {btn: b?{l:b.getAttribute('aria-label'),dis:b.disabled}:null, nodes, inline, vs:document.visibilityState};
    });
    for(const n of s.nodes){const k=strip(n.t)+'|'+n.w+'x'+n.h; const p=seen.get(k)||{t:n.t,size:n.w+'x'+n.h,first:null,last:null}; if(p.first===null)p.first=Date.now()-t0; p.last=Date.now()-t0; seen.set(k,p);}
    const key=JSON.stringify([s.btn,s.inline,s.vs]); if(key!==prev){changes.push({at:Date.now(),btn:s.btn,inline:s.inline,vs:s.vs}); prev=key;}
    await page.waitForTimeout(every);
  }
  return {changes, notices:[...seen.values()]};
};
