import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const q = window.__qa;
    const vis = (e) => q.vis(e) || q.boxVis(e);
    const T = (e) => (e.innerText || '').replace(/\s+/g, ' ').trim();
    const acts = [...document.querySelectorAll('button[aria-label*="Participant actions"]')].filter(vis);
    let el = acts[0], found = null;
    const chain = [];
    while (el) {
      if (acts.every(a => el.contains(a))) {
        chain.push({tag: el.tagName, cls: (el.className||'').toString().slice(0,70), len: T(el).length,
                    rect: (()=>{const r=el.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];})()});
      }
      el = el.parentElement;
    }
    // the panel: widest ancestor whose width < 600 (side panel)
    const cands = [...document.querySelectorAll('div,aside,section')].filter(e => {
      if (!vis(e)) return false;
      const r = e.getBoundingClientRect();
      return r.width > 200 && r.width < 620 && r.height > 300 && acts.every(a => e.contains(a));
    });
    cands.sort((a,b)=>T(b).length - T(a).length);
    const p = cands[0] || null;
    return { chain, nCands: cands.length,
      panelFull: p ? T(p) : null,
      panelRect: p ? (()=>{const r=p.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)];})() : null,
      panelAllInteractive: p ? [...p.querySelectorAll('button,a,input,[role=tab],[role=switch],[tabindex]')].filter(vis).map(x=>({
        tag:x.tagName, l:(x.getAttribute('aria-label')||x.textContent||x.placeholder||'').replace(/\s+/g,' ').trim().slice(0,60),
        d: x.disabled||x.getAttribute('aria-disabled')==='true'})) : []
    };
  });
};
