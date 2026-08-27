import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 45000);
  return await page.evaluate(async ([v,ms])=>{ const vis=eval(v); const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const btns=[...document.querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
      const key=btns.filter(l=>/Meeting settings|Record|End for everyone|Participant actions|Admin permissions|Call diagnostics/i.test(l));
      const panel=document.querySelector('[data-testid="call-side-panel-slot"]');
      const s={key:[...new Set(key)].sort(), roles:(panel?(panel.innerText||'').replace(/\s+/g,' ').slice(0,150):null)};
      const k=JSON.stringify(s); if(k!==last){ out.push({ms:Date.now()-t0, at:Date.now(), ...s}); last=k; }
      await new Promise(r=>setTimeout(r,500)); }
    return out; }, [VIS, MS]);
}
