import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 45000);
  return await page.evaluate(async ([v,ms])=>{ const vis=eval(v); const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const tiles=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
        .map(t=>{const r=t.getBoundingClientRect();
          const n=(t.querySelector('[data-testid="participant-name"]')||{}).textContent||'';
          const pinned=!!t.querySelector('[data-testid="participant-pinned-for-everyone"]');
          return {n:n.trim().slice(0,16), a:Math.round(r.width*r.height/1000), pinned};});
      const big = tiles.length? tiles.reduce((x,y)=>y.a>x.a?y:x) : null;
      const tg=document.querySelector('[data-testid="call-view-toggle"]');
      const s={big: big?big.n:null, bigArea: big?big.a:null,
        anyPinBadge: tiles.some(t=>t.pinned), toggle: tg?tg.getAttribute('aria-label'):null};
      const k=JSON.stringify(s); if(k!==last){ out.push({ms:Date.now()-t0, at:Date.now(), ...s}); last=k; }
      await new Promise(r=>setTimeout(r,500)); }
    return out; }, [VIS, MS]);
}
