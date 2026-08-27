import { VIS } from './a-nb-lib.mjs';
// Poll: biggest tile, any pin badge, and the view-toggle aria-label (which the host's
// client rewrites to "The host pinned <name> for everyone"). Records changes only.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 40000);
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
        .map(b=>(b.getAttribute('aria-label')||'').trim())
        .filter(x=>/view$|pinned|spotlight/i.test(x));
      const rowsPinned=[...document.querySelectorAll('[data-testid="participant-row"]')].filter(vis)
        .filter(r=>/pin/i.test([...r.querySelectorAll('[aria-label],[data-testid]')]
          .map(y=>(y.getAttribute('aria-label')||'')+' '+(y.getAttribute('data-testid')||'')).join(' ')))
        .map(r=>(r.innerText||'').replace(/\s+/g,' ').slice(0,30));
      return {big:tiles[0]?tiles[0].w:'-', badge:tiles.filter(t=>t.p).map(t=>t.w), tog, rowsPinned};
    };
    while(Date.now()-t0<ms){
      const s=snap(); const k=JSON.stringify(s);
      if(k!==last){ out.push({ms:Date.now()-t0, ...s}); last=k; }
      await new Promise(x=>setTimeout(x,300)); }
    return out; }, [VIS, MS]);
};
