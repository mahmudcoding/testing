export default async ({page}) => page.evaluate((tid) => {
  const b = document.querySelector(`[data-testid="${tid}"]`);
  if (!b) return {found:false};
  const r = b.getBoundingClientRect();
  const cx = Math.round(r.left + r.width/2), cy = Math.round(r.top + r.height/2);
  const top = document.elementFromPoint(cx, cy);
  const desc = (e) => e ? (e.tagName.toLowerCase()
      + (e.getAttribute('data-testid') ? '[tid='+e.getAttribute('data-testid')+']' : '')
      + (e.className && typeof e.className === 'string' ? '.'+e.className.trim().split(/\s+/).slice(0,3).join('.') : '')) : null;
  const chain = []; let n = top;
  while (n && chain.length < 6) { chain.push(desc(n)); n = n.parentElement; }
  const cs = getComputedStyle(b);
  return {
    found: true,
    rect: {x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height)},
    center: [cx, cy],
    inViewport: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth,
    viewport: [innerWidth, innerHeight],
    topElement: desc(top),
    topIsButtonOrChild: !!(top && (top === b || b.contains(top))),
    chain,
    btn: {disabled: b.disabled, pointerEvents: cs.pointerEvents, visibility: cs.visibility, opacity: cs.opacity},
    visState: document.visibilityState, hasFocus: document.hasFocus()
  };
}, process.env.QA_TID || 'call-controls-leave');
