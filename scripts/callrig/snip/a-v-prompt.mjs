// Verify pass: watch specifically for the breakout invite prompt element and time its life.
export default async ({ page }) => {
  const MS = parseInt(process.env.QA_MS||'45000',10);
  return await page.evaluate(async (MS) => {
    const SEL = '[data-testid="app-breakout-invite-prompt"]';
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      let n = el, op = 1;
      while (n && n !== document.documentElement) { op *= parseFloat(getComputedStyle(n).opacity||'1'); n = n.parentElement; }
      if (op <= 0.05) return false;
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const hit = document.elementFromPoint(cx, cy);
      return !!hit && (el.contains(hit) || hit.contains(el));
    };
    const t0 = performance.now(); let appeared=null, gone=null, sample=null, rect=null;
    while (performance.now() - t0 < MS) {
      const el = document.querySelector(SEL);
      const on = !!el && vis(el);
      if (on && appeared === null) {
        appeared = Math.round(performance.now()-t0);
        const r = el.getBoundingClientRect();
        rect = [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)];
        sample = (el.innerText||'').replace(/\s+/g,' ').trim().slice(0,120);
      }
      if (!on && appeared !== null && gone === null) { gone = Math.round(performance.now()-t0); break; }
      await new Promise(r => setTimeout(r, 250));
    }
    return {selector: SEL, appearedAtMs: appeared, disappearedAtMs: gone,
            lifetimeMs: (appeared!==null && gone!==null) ? gone-appeared : null,
            rect, text: sample, visibilityState: document.visibilityState};
  }, MS);
};
