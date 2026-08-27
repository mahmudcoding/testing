export default async ({page}) => {
  const before = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='recording-start-access-trigger');
    return b?{label:b.getAttribute('aria-label'),pressed:b.getAttribute('aria-pressed')}:{err:'no rec btn'};
  });
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='recording-start-access-trigger'); if(b)b.click();});
  await page.waitForTimeout(3000);
  const vis=`(e)=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;}`;
  const dlg = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    return [...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded')
      .map(d=>({tid:d.getAttribute('data-testid'), t:(d.innerText||'').replace(/\s+/g,' ').slice(0,220),
        b:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,26))}));
  });
  return {before, dialogAfterClick: dlg};
};
