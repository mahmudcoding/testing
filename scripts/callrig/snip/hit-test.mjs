export default async ({page}) => {
  return await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].filter(b=>/^Join$|^Join room$/.test(b.textContent.trim()));
    return btns.map(b => {
      const r = b.getBoundingClientRect();
      const cx = Math.round(r.left + r.width/2), cy = Math.round(r.top + r.height/2);
      const hit = document.elementFromPoint(cx, cy);
      const isSelfOrChild = hit && (hit === b || b.contains(hit) || hit.contains(b));
      const chain = []; let e = hit; for (let i=0;i<4&&e;i++){ chain.push(`${e.tagName}${e.getAttribute&&e.getAttribute('data-testid')?'['+e.getAttribute('data-testid')+']':''}.${(e.className||'').toString().slice(0,40)}`); e=e.parentElement; }
      return {text: b.textContent.trim(), rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
        inViewport: r.top>=0 && r.left>=0 && r.bottom<=innerHeight && r.right<=innerWidth,
        innerWidth, innerHeight,
        hitIsButton: isSelfOrChild, hitChain: chain,
        btnPointerEvents: getComputedStyle(b).pointerEvents, btnOpacity: getComputedStyle(b).opacity, disabled: b.disabled};
    });
  });
};
