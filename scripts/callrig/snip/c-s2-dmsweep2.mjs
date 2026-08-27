export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OWSYMJ03CFIKL';
  await page.evaluate(async (dm)=>{
    await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:dm, body:'QA-DMSWEEP seed'})});}, dm);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(12000);
  const msg=page.locator('main [data-message-id]').last();
  await msg.hover().catch(()=>{});
  await page.waitForTimeout(1500);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const list=document.querySelector('main [data-message-id]');
    if(!list) return {error:'still no messages'};
    const lb=list.getBoundingClientRect();
    const left=lb.left-60, top=40;
    const ctrls=[...document.querySelectorAll('button,a,[role="button"]')].filter(v)
      .filter(e=>{const r=e.getBoundingClientRect();
        return r.left>=left && r.top>=top && r.top<innerHeight;})
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,30));
    return {controls:[...new Set(ctrls)].sort(), count:new Set(ctrls).size};
  });
};
