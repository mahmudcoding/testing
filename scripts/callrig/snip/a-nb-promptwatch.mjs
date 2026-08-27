import { VIS } from './a-nb-lib.mjs';
// Watch the WHOLE visible DOM for text matching a regex — not just toast containers.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 30000);
  const rx = process.env.QA_RX || 'asked|return';
  return await page.evaluate(async ([v, ms, r])=>{ const vis=eval(v); const re=new RegExp(r,'i');
    const out=[]; const t0=Date.now(); let last='';
    const grab=()=>{
      const hits=[];
      for (const e of document.querySelectorAll('*')) {
        if (e.childElementCount) continue;
        const t=(e.textContent||'').trim();
        if (t && t.length<160 && re.test(t) && vis(e)) hits.push(t.slice(0,110));
      }
      return [...new Set(hits)];
    };
    while(Date.now()-t0<ms){
      const h=grab(); const k=JSON.stringify(h);
      if(k!==last){ out.push({ms:Date.now()-t0, at:Date.now(), hits:h}); last=k; }
      await new Promise(x=>setTimeout(x,400)); }
    return out; }, [VIS, MS, rx]);
}
