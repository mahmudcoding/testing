export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    // leaf-ish visible nodes whose whole text is the limit message
    const target='This meeting has reached its participant limit.';
    const all=[...document.querySelectorAll('*')].filter(e=>v(e) && (e.innerText||'').trim()===target);
    // keep only the outermost distinct ones (drop ancestors that contain another match)
    const outer=all.filter(e=>!all.some(o=>o!==e && o.contains(e)));
    const li=[...document.querySelectorAll('li[data-sonner-toast],[data-sonner-toast]')].filter(v);
    return {
      exactMatches: all.length,
      distinctBlocks: outer.length,
      blocks: outer.map(e=>({tag:e.tagName, role:e.getAttribute('role'), tid:e.getAttribute('data-testid'),
        rect:(()=>{const r=e.getBoundingClientRect(); return {x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)};})()})),
      sonnerToasts: li.length,
      sonnerText: li.map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60))
    };
  });
};
