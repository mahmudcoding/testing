import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    const b=document.querySelector('[data-qa-target="1"]') ||
            [...document.querySelectorAll('[data-testid="side-room-action"]')].filter(vis).pop();
    if(!b) return {err:'no button'};
    const r=b.getBoundingClientRect();
    const cx=Math.round(r.x+r.width/2), cy=Math.round(r.y+r.height/2);
    const top=document.elementFromPoint(cx,cy);
    const cls = e => String(e && e.className && e.className.baseVal!==undefined ? e.className.baseVal : (e&&e.className)||'');
    let chain=[], n=top;
    for(let i=0;i<5 && n;i++){ chain.push(n.tagName.toLowerCase()+(n.getAttribute&&n.getAttribute('data-testid')?('#'+n.getAttribute('data-testid')):'')+'.'+cls(n).slice(0,40)); n=n.parentElement; }
    return {rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
      centre:{cx,cy}, viewport:{w:window.innerWidth,h:window.innerHeight},
      topAtCentre: top?top.tagName.toLowerCase()+' '+cls(top).slice(0,60):null,
      isTheButton: top===b || (top && b.contains(top)),
      chain}; }, VIS);
}
