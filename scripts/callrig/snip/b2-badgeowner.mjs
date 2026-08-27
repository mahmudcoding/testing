export default async ({ page }) => {
  return await page.evaluate(() => {
    const wc = document.querySelector('[data-testid="call-controls-waiting-count"]');
    if (!wc) return 'NOT-FOUND';
    const chain = [];
    let n = wc;
    for (let i = 0; i < 7 && n; i++) {
      chain.push({ tag:n.tagName, tid:n.getAttribute('data-testid'),
                   al:n.getAttribute('aria-label'), cls:(n.className||'').toString().slice(0,44),
                   text:(n.innerText||'').replace(/\n+/g,' ').trim().slice(0,50) });
      n = n.parentElement;
    }
    const r = wc.getBoundingClientRect();
    return { chain, rect:{x:Math.round(r.x), y:Math.round(r.y)},
             atPoint: (()=>{ const e=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
               const b = e && e.closest('button');
               return b ? { tid:b.getAttribute('data-testid'), al:b.getAttribute('aria-label') } : null; })() };
  });
};
