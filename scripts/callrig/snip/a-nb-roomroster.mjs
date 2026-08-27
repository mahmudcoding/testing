import { VIS } from './a-nb-lib.mjs';
// Watch the side-room roster (tiles + side panel) for MS, stamping absolute time.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 90000);
  return await page.evaluate(async ([v,ms])=>{ const vis=eval(v); const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const tiles=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
        .map(t=>((t.querySelector('[data-testid="participant-name"]')||{}).textContent||'').trim()).filter(Boolean);
      const panel=document.querySelector('[data-testid="call-side-panel-slot"]');
      const s={tiles:[...new Set(tiles)].sort(),
        panel: panel?(panel.innerText||'').replace(/\s+/g,' ').slice(0,200):null};
      const k=JSON.stringify(s); if(k!==last){ out.push({ms:Date.now()-t0, at:Date.now(), ...s}); last=k; }
      await new Promise(r=>setTimeout(r,500)); }
    return out; }, [VIS, MS]);
}
