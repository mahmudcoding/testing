import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  const r = await page.evaluate(() => {
    const q = window.__qa;
    const T = (e) => (e.innerText || '').replace(/\s+/g, ' ').trim();
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const t = T(el);
      if (!/BLOCKED \(/.test(t)) continue;
      if (t.length > 400) continue;
      const rect = el.getBoundingClientRect();
      out.push({ tag: el.tagName, text: t.slice(0,300),
        rect: [Math.round(rect.x),Math.round(rect.y),Math.round(rect.width),Math.round(rect.height)],
        op: q.opacity ? q.opacity(el) : null, vis: q.vis(el), boxVis: q.boxVis(el),
        cs: (()=>{const c=getComputedStyle(el); return {d:c.display,v:c.visibility,o:c.opacity,oh:c.overflow};})() });
    }
    // also: what does elementFromPoint say at the paragraph's centre
    return out.slice(-6);
  });
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/35aff4f2-ec6d-4eac-9d00-6ec51c006d6e/scratchpad/m-panel.png'});
  return r;
};
