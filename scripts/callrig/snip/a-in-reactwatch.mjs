export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const hits=[]; const t0=Date.now();
    while(Date.now()-t0 < 22000){
      const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const found=[...r.querySelectorAll('*')].filter(e=>{
        const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
        return /[\u{1F44F}\u{1F44D}\u{2764}\u{1F602}\u{1F389}\u{1F62E}]/u.test(own);
      });
      if(found.length){
        for(const e of found.slice(0,3)){
          const q=e.getBoundingClientRect();
          hits.push({t:Date.now()-t0, ch:(e.textContent||'').trim().slice(0,6),
            rect:[Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)],
            cls:(e.className||'').toString().slice(0,50)});
        }
        if(hits.length>6) break;
      }
      await new Promise(r=>setTimeout(r,250));
    }
    const canvases=[...document.querySelectorAll('canvas')].map(c=>c.width+'x'+c.height);
    return {hits, canvases};
  });
};
