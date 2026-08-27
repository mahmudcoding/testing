import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const ms = Number(process.env.QA_MS || 40000), step = Number(process.env.QA_STEP || 400);
  const pat = process.env.QA_PAT || 'asked you|return to the main room|turn on your|muted your|stopped your|not allowed';
  await page.evaluate(DOM);
  const t0 = Date.now(); const hits = new Map(); let samples = 0; const vis = new Set();
  while (Date.now() - t0 < ms) {
    let r;
    try { r = await page.evaluate((p) => {
      const re = new RegExp(p, 'i');
      const out = [];
      const walk = document.querySelectorAll('body *');
      for (const n of walk) {
        if (n.children.length) continue;
        const t = (n.innerText || n.textContent || '').replace(/\s+/g,' ').trim();
        if (!t || t.length > 200 || !re.test(t)) continue;
        if (!window.__qa.boxVis(n)) continue;
        const b = n.getBoundingClientRect();
        out.push({ text: t.slice(0,140), tag: n.tagName, w: Math.round(b.width), h: Math.round(b.height) });
      }
      return { vis: document.visibilityState, out };
    }, pat); } catch { r = { vis:'?', out: [] }; }
    samples++; vis.add(r.vis);
    for (const h of r.out) { const k = `${h.text}|${h.tag}|${h.w}x${h.h}`; if (!hits.has(k)) hits.set(k, { ...h, firstMs: Date.now()-t0 }); }
    await page.waitForTimeout(step);
  }
  return { samples, visibility: [...vis], hits: [...hits.values()].sort((a,b)=>a.firstMs-b.firstMs) };
};
