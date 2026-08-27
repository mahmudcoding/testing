export default async ({page}) => page.evaluate(()=>{
  return [...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"]')]
    .map(e=>{
      const r=e.getBoundingClientRect(), cs=getComputedStyle(e);
      return {text:e.innerText.replace(/\n+/g,' ').trim().slice(0,50),
        role:e.getAttribute('role'), tid:e.getAttribute('data-testid'),
        rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],
        vis:cs.visibility, disp:cs.display, op:cs.opacity, clip:cs.clip, clipPath:cs.clipPath,
        pos:cs.position, overflow:cs.overflow,
        offscreen: r.width===0||r.height===0||r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight,
        ariaLive:e.getAttribute('aria-live'), cls:(e.className||'').toString().slice(0,50)};
    });
});
