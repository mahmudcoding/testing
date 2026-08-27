import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const ms = Number(process.env.QA_MS || 30000), step = Number(process.env.QA_STEP || 300);
  const emo = (process.env.QA_EMOJI || '🎉');
  await page.evaluate(DOM);
  const t0 = Date.now(); const hits = new Map(); let n=0; const vis=new Set();
  while (Date.now() - t0 < ms) {
    let r;
    try { r = await page.evaluate((e) => {
      const out=[];
      for (const node of document.querySelectorAll('body *')) {
        if (node.children.length) continue;
        const t=(node.textContent||'').trim();
        if (!t.includes(e)) continue;
        if (!window.__qa.boxVis(node)) continue;
        const b=node.getBoundingClientRect();
        const chain=[]; let p=node;
        for (let i=0;i<6&&p;i++,p=p.parentElement){ const d=p.getAttribute&&p.getAttribute('data-testid'); if(d) chain.push(d); }
        out.push({text:t.slice(0,24), w:Math.round(b.width), h:Math.round(b.height), chain});
      }
      return {vis:document.visibilityState, out};
    }, emo); } catch { r={vis:'?',out:[]}; }
    n++; vis.add(r.vis);
    for (const h of r.out) { const k=`${h.text}|${h.w}x${h.h}|${h.chain.join('>')}`; if(!hits.has(k)) hits.set(k,{...h, firstMs: Date.now()-t0}); }
    await page.waitForTimeout(step);
  }
  return { emoji: emo, samples:n, visibility:[...vis], hits:[...hits.values()].sort((a,b)=>a.firstMs-b.firstMs) };
};
