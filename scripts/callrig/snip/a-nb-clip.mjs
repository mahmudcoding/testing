import { VIS } from './a-nb-lib.mjs';
// Leaf-node clipping scan: scrollWidth > clientWidth (or height) on elements that actually hold text.
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    const out=[];
    const all=document.querySelectorAll('*');
    for (const e of all) {
      if (e.childElementCount > 0) continue;              // leaves only
      const txt=(e.textContent||'').trim();
      if (!txt || txt.length < 2) continue;
      if (!vis(e)) continue;
      const cs=getComputedStyle(e);
      if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.textOverflow !== 'ellipsis') {
        // still record real overflow even when visible, it can spill
      }
      const dx = e.scrollWidth - e.clientWidth;
      const dy = e.scrollHeight - e.clientHeight;
      if (dx > 1 || dy > 1) {
        const r=e.getBoundingClientRect();
        out.push({txt: txt.slice(0,50), tag:e.tagName.toLowerCase(),
          dx, dy, w:Math.round(r.width), h:Math.round(r.height),
          ellipsis: cs.textOverflow==='ellipsis', ovf: cs.overflow+'/'+cs.overflowX,
          tid: e.getAttribute('data-testid')});
      }
    }
    // also: controls pushed outside the viewport
    const offscreen=[...document.querySelectorAll('button,a,[role="button"]')].filter(vis)
      .map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,40), r:b.getBoundingClientRect()}))
      .filter(x=>x.r.left >= window.innerWidth || x.r.right <= 0 || x.r.top >= window.innerHeight)
      .map(x=>({l:x.l, left:Math.round(x.r.left), top:Math.round(x.r.top)}));
    return {docScrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
      clipped: out.slice(0,20), offscreenControls: offscreen.slice(0,10)}; }, VIS);
}
