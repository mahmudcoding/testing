export default async ({page}) => {
  const N=Number(process.env.QA_N||10), EVERY=Number(process.env.QA_EVERY||4000);
  const samples=[];
  for(let i=0;i<N;i++){
    samples.push(await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); if(r.width<=1||r.height<=1) return false;
        let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;};
      const t=document.body.innerText.replace(/\s+/g,' ');
      return {t:new Date().toISOString(),
        calling:/is calling/i.test(t), missed:/Missed call/i.test(t),
        accept:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(x=>/^(Accept|Decline)$/i.test(x)),
        excerpt:(t.match(/.{0,30}(is calling|Missed call).{0,50}/i)||[])[0]||null,
        vis:document.visibilityState};
    }));
    if(i<N-1) await page.waitForTimeout(EVERY);
  }
  const key=s=>JSON.stringify([s.calling,s.missed,s.accept,s.excerpt]);
  const uniq=[]; let prev='';
  for(const s of samples){const k=key(s); if(k!==prev){uniq.push(s);prev=k;}}
  return {n:samples.length, spanSec:Math.round((Date.parse(samples[samples.length-1].t)-Date.parse(samples[0].t))/1000), changes:uniq};
};
