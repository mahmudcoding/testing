export default async ({page}) => {
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-breakout-rooms'); if(b)b.click();});
  await page.waitForTimeout(2500);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;};
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"],[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const pick=p[p.length-1]; if(!pick) return {err:'no panel'};
    return {tid:pick.getAttribute('data-testid'), text:(pick.innerText||'').replace(/\n+/g,' | ').slice(0,500),
      btns:[...pick.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,28))+(b.getAttribute('data-testid')?' {'+b.getAttribute('data-testid')+'}':''))};
  });
};
