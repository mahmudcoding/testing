export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OWSYMJ03CFIKL';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(12000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const list=document.querySelector('main [data-message-id]');
    if(!list) return {error:'no messages'};
    // conversation region = right of the sidebar, below the global top bar
    const lb=list.getBoundingClientRect();
    const left=lb.left-40, top=40;
    const ctrls=[...document.querySelectorAll('button,a,[role="button"]')].filter(v)
      .filter(e=>{const r=e.getBoundingClientRect();
        return r.left>=left && r.top>=top && r.top<innerHeight;})
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,30));
    return {regionLeft:Math.round(left),
      controls:[...new Set(ctrls)].sort(), count:new Set(ctrls).size};
  });
};
