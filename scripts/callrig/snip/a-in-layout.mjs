export default async ({page}) => {
  return await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const grid=r.querySelector('[role="group"][aria-label="Call participants"]');
    const tiles=[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(b=>{
      let n=b, best=b;
      while(n&&n!==r){ const q=n.getBoundingClientRect(); if(q.width>120&&q.height>90){best=n;break;} n=n.parentElement; }
      const q=best.getBoundingClientRect();
      return {who:(b.getAttribute('aria-label')||'').replace('Participant actions for ',''),
        x:Math.round(q.left),y:Math.round(q.top),w:Math.round(q.width),h:Math.round(q.height)};
    });
    const vt=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-view-toggle');
    return {viewToggle: vt?{label:vt.getAttribute('aria-label'),pressed:vt.getAttribute('aria-pressed')}:null,
      gridLayout: grid?grid.getAttribute('data-grid-layout'):null, tiles,
      videoCount:[...r.querySelectorAll('video')].filter(v=>v.getClientRects().length).length};
  });
};
