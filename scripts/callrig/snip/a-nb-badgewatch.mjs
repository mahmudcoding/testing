import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 45000);
  return await page.evaluate(async ([v,ms])=>{ const vis=eval(v); const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const b=document.querySelector('[data-testid="call-recording-badge"]');
      const present = !!b && vis(b);
      const r = b ? b.getBoundingClientRect() : null;
      // also collect any visible leaf text about recording
      const msgs=[];
      for (const e of document.querySelectorAll('*')) {
        if (e.childElementCount) continue;
        const t=(e.textContent||'').trim();
        if (t && t.length<60 && /record/i.test(t) && vis(e)) msgs.push(t.slice(0,50));
      }
      const s={badge:present, txt: b?(b.innerText||'').trim():null,
               size: r?`${Math.round(r.width)}x${Math.round(r.height)}`:null, msgs:[...new Set(msgs)]};
      const k=JSON.stringify(s); if(k!==last){ out.push({ms:Date.now()-t0, at:Date.now(), ...s}); last=k; }
      await new Promise(x=>setTimeout(x,300)); }
    return out; }, [VIS, MS]);
}
