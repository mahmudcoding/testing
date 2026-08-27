import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 45000);
  return await page.evaluate(async ([v,ms])=>{ const vis=eval(v); const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const b=[...document.querySelectorAll('button')].filter(vis)
        .find(x=>/^(Record|Stop recording)$/.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
      const s=b?{l:(b.getAttribute('aria-label')||b.innerText||'').trim(), disabled:!!b.disabled}:null;
      const k=JSON.stringify(s); if(k!==last){ out.push({ms:Date.now()-t0, ...(s||{gone:true})}); last=k; }
      await new Promise(r=>setTimeout(r,500)); }
    return out; }, [VIS, MS]);
}
