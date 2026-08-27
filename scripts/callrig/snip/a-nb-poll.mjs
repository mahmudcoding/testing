import { VIS } from './a-nb-lib.mjs';
// Poll the page at ~300ms for MS milliseconds, recording every distinct visible-state fingerprint.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 25000);
  const res = await page.evaluate(async ([v, ms]) => {
    const vis = eval(v);
    const seen = [], t0 = Date.now();
    const grab = () => {
      const dlgs = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis);
      const notes = [...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"],[class*="toast"],[class*="Toast"],[class*="banner"],[class*="Banner"],[class*="notice"]')]
        .filter(vis)
        .map(n => { const r = n.getBoundingClientRect();
          return {txt:(n.innerText||'').replace(/\s+/g,' ').slice(0,200), w:Math.round(r.width), h:Math.round(r.height)}; })
        .filter(n => n.txt && n.w > 8 && n.h > 8);
      return { p: location.pathname + location.search,
        dlg: dlgs.map(d => ({txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
              btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,32)).filter(Boolean)})),
        notes,
        main: (document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,220) };
    };
    let last = '';
    while (Date.now() - t0 < ms) {
      const s = grab(); const k = JSON.stringify(s);
      if (k !== last) { seen.push({ms: Date.now()-t0, at: Date.now(), ...s}); last = k; }
      await new Promise(r => setTimeout(r, 300));
    }
    return seen;
  }, [VIS, MS]);
  return {samples: res.length, states: res};
}
