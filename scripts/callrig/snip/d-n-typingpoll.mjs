export default async ({page}) => {
  const ms = +(process.env.QA_MS||40000), every=300;
  const t0=Date.now(); const samples=[];
  while (Date.now()-t0 < ms) {
    const s = await page.evaluate(()=>{
      const e=document.querySelector('[data-testid="in-call-chat-typing"]');
      const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const l=document.querySelector('[data-testid="in-call-chat-list"]');
      return {t:e?(e.innerText||'').replace(/\s+/g,' ').trim():null, v:vis(e),
        vs:document.visibilityState,
        n:l?l.querySelectorAll('[data-testid="ic-user-message"]').length:-1};
    });
    samples.push({ms:Date.now()-t0, ...s});
    await page.waitForTimeout(every);
  }
  // collapse consecutive identical
  const out=[]; let prev=null;
  for (const s of samples){ const k=`${s.t}|${s.v}|${s.n}|${s.vs}`; if(k!==prev){out.push(s); prev=k;} }
  return {n:samples.length, changes:out};
};
