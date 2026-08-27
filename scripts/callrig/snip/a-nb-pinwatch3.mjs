import { VIS } from './a-nb-lib.mjs';
// Same as pinwatch2 plus a positive control: the set of participants whose panel row
// carries a "Hand raised" mark, and the network-quality string. Records changes only.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 60000);
  return await page.evaluate(async ([v, ms])=>{ const vis=eval(v);
    const out=[]; const t0=Date.now(); let last='';
    const snap=()=>{
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const tiles=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
        .map(t=>{const r=t.getBoundingClientRect();
          return {w:(t.querySelector('[data-testid="participant-name"]')?.textContent||'').trim(),
                  a:Math.round(r.width*r.height/1000),
                  p:!!t.querySelector('[data-testid*="pinned"]')};})
        .sort((a,b)=>b.a-a.a);
      const tog=[...document.querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||'').trim()).filter(x=>/view$|pinned/i.test(x));
      const hands=[...document.querySelectorAll('[data-testid="participant-row"]')].filter(vis)
        .filter(r=>[...r.querySelectorAll('[aria-label]')].some(y=>/hand raised/i.test(y.getAttribute('aria-label')||'')))
        .map(r=>(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,20));
      const q=(document.querySelector('[data-testid="participant-network-indicator"]')||{}).getAttribute
              ? document.querySelector('[data-testid="participant-network-indicator"]').getAttribute('aria-label') : null;
      return {big:tiles[0]?tiles[0].w:'-', badge:tiles.filter(t=>t.p).map(t=>t.w), tog, hands, q};
    };
    while(Date.now()-t0<ms){
      const s=snap(); const k=JSON.stringify(s);
      if(k!==last){ out.push({ms:Date.now()-t0, ...s}); last=k; }
      await new Promise(x=>setTimeout(x,300)); }
    return out; }, [VIS, MS]);
};
