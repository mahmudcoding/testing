export default async ({page}) => {
  const rd=()=>page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const grid=r.querySelector('[role="group"][aria-label="Call participants"]');
    const vt=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-view-toggle');
    const tiles=[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(b=>{
      let n=b,best=b; while(n&&n!==r){const q=n.getBoundingClientRect(); if(q.width>120&&q.height>90){best=n;break;} n=n.parentElement;}
      const q=best.getBoundingClientRect();
      return (b.getAttribute('aria-label')||'').replace('Participant actions for ','')+' '+Math.round(q.width)+'x'+Math.round(q.height)+' @'+Math.round(q.left)+','+Math.round(q.top);});
    return {label:vt?vt.getAttribute('aria-label'):null, pressed:vt?vt.getAttribute('aria-pressed'):null,
      layout:grid?grid.getAttribute('data-grid-layout'):null, tiles};
  });
  const a=await rd();
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-view-toggle'); if(b)b.click();});
  await page.waitForTimeout(3000);
  const b=await rd();
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const x=[...r.querySelectorAll('button')].find(y=>y.getAttribute('data-testid')==='call-view-toggle'); if(x)x.click();});
  await page.waitForTimeout(3000);
  const c=await rd();
  return {before:a, afterToggle:b, afterToggleBack:c};
};
