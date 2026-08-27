import { VIS } from './a-nb-lib.mjs';
// Record WHERE an emoji appears: element, its testid chain, and size.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 24000);
  return await page.evaluate(async ([v,ms])=>{ const vis=eval(v);
    const re=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const hits=[];
      for (const e of document.querySelectorAll('*')) {
        if (e.childElementCount) continue;
        const t=(e.textContent||'').trim();
        if (!t || t.length>4 || !re.test(t)) continue;
        if (!vis(e)) continue;
        const r=e.getBoundingClientRect();
        let chain=[], n=e;
        for(let i=0;i<6 && n;i++){ const tid=n.getAttribute&&n.getAttribute('data-testid'); if(tid) chain.push(tid); n=n.parentElement; }
        hits.push({e:t, w:Math.round(r.width), h:Math.round(r.height), y:Math.round(r.top), chain});
      }
      const k=JSON.stringify(hits); if(k!==last){ out.push({ms:Date.now()-t0, hits}); last=k; }
      await new Promise(x=>setTimeout(x,300)); }
    return out; }, [VIS, MS]);
}
