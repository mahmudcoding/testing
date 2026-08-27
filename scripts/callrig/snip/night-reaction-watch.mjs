export default async ({page}) => {
  const ms = Number(process.env.QA_MS || 25000);
  return await page.evaluate(async (ms) => {
    const seen = [];
    const t0 = Date.now();
    const snap = () => {
      const out = [];
      // any element whose text is a lone emoji, plus known reaction testids
      document.querySelectorAll('[data-testid*="reaction"],[class*="reaction" i]').forEach(e=>{
        out.push({sel: e.getAttribute('data-testid')||e.className.toString().slice(0,40), txt:(e.innerText||'').replace(/\n+/g,'/').slice(0,60)});
      });
      return out;
    };
    let last = JSON.stringify(snap());
    while (Date.now() - t0 < ms) {
      await new Promise(r=>setTimeout(r,300));
      const cur = snap(); const s = JSON.stringify(cur);
      if (s !== last) { seen.push({at: Date.now()-t0, items: cur}); last = s; }
    }
    return {watchedMs: ms, changes: seen};
  }, ms);
};
