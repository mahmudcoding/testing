export default async ({page}) => {
  const before = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-screen-share');
    return b?{aria:b.getAttribute('aria-label'), disabled:b.disabled}:{err:'no btn'};});
  await page.click('button[data-testid="call-controls-screen-share"]');
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-screen-share');
    return {btn:b?{aria:b.getAttribute('aria-label'), disabled:b.disabled}:null,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(e=>{const q=e.getBoundingClientRect();return q.width>20&&q.height>10;}).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,70)),
      dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(vis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded').map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,100))};});
  return {before, after};
};
