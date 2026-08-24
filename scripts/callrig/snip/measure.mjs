export default async ({page}) => {
  return await page.evaluate(() => {
    const out = {viewport: {w: innerWidth, h: innerHeight}, docScrollW: document.documentElement.scrollWidth};
    const btns = [...document.querySelectorAll('button')].filter(b => (b.getAttribute('aria-label')||b.textContent||'').trim());
    out.controls = btns.map(b => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      return {l: (b.getAttribute('aria-label')||b.textContent).trim().slice(0,32),
              x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
              vis: cs.visibility, disp: cs.display, op: cs.opacity,
              offscreen: r.left >= innerWidth || r.right <= 0 || r.top >= innerHeight || r.bottom <= 0 || r.width===0};
    }).filter(x => x.offscreen || x.vis!=='visible' || x.op==='0' || x.w===0);
    out.clipped = [...document.querySelectorAll('*')].filter(e => e.children.length===0 && e.scrollWidth > e.clientWidth+1 && e.clientWidth>0)
      .slice(0,10).map(e => ({t:(e.textContent||'').trim().slice(0,40), sw:e.scrollWidth, cw:e.clientWidth}));
    return out;
  });
};
