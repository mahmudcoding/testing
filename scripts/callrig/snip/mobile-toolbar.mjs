export default async ({page}) => {
  return await page.evaluate(() => {
    const tb = document.querySelector('[data-testid="call-toolbar"]');
    const vw = innerWidth;
    const chainOf = el => { const c=[]; let e=el; for(let i=0;i<6&&e;i++){ e=e.parentElement; if(!e)break; const s=getComputedStyle(e); c.push({tag:e.tagName, tid:e.getAttribute('data-testid'), ox:s.overflowX, sw:e.scrollWidth, cw:e.clientWidth, st:e.scrollLeft}); } return c; };
    const btn = [...tb.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'')==='More');
    const sr  = [...tb.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'')==='Side Rooms');
    const tbr = tb.getBoundingClientRect();
    return {
      vw, docScrollW: document.documentElement.scrollWidth, bodyScrollW: document.body.scrollWidth,
      toolbar: {rect:{x:Math.round(tbr.x),w:Math.round(tbr.width)}, sw:tb.scrollWidth, cw:tb.clientWidth, ox:getComputedStyle(tb).overflowX, sl:tb.scrollLeft},
      moreChain: btn? chainOf(btn):null,
      moreRect: btn? (()=>{const r=btn.getBoundingClientRect(); return {x:Math.round(r.x), right:Math.round(r.right), w:Math.round(r.width), display:getComputedStyle(btn).display, vis:getComputedStyle(btn).visibility, op:getComputedStyle(btn).opacity};})():null,
      srRect: sr? (()=>{const r=sr.getBoundingClientRect(); return {x:Math.round(r.x), right:Math.round(r.right), display:getComputedStyle(sr).display};})():null,
      hitAtMore: btn? (()=>{const r=btn.getBoundingClientRect(); const e=document.elementFromPoint(Math.min(vw-2,Math.round(r.left+r.width/2)), Math.round(r.top+r.height/2)); return e? e.tagName+'/'+(e.getAttribute('aria-label')||'').slice(0,20):null;})():null
    };
  });
};
