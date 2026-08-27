export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const reqs=[];
  const onReq=(r)=>{const u=r.url();
    if(u.includes('/api/v1/')&&/messages\?/.test(u)) reqs.push(u.split('/messages')[1].slice(0,52));};
  page.on('request',onReq);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  await page.evaluate(()=>{
    const m=document.querySelector('main [data-message-id]');
    let n=m&&m.parentElement;
    while(n&&n!==document.body){const s=getComputedStyle(n);
      if(n.scrollHeight>n.clientHeight+40&&/auto|scroll/.test(s.overflowY)){n.setAttribute('data-qa-scroller','1');return;}
      n=n.parentElement;}});
  const snap=()=>page.evaluate(()=>{
    const sc=document.querySelector('[data-qa-scroller]');
    return {h:sc?Math.round(sc.scrollHeight):null, top:sc?Math.round(sc.scrollTop):null};});
  const steps=[{step:'initial', ...(await snap())}];
  for (let i=1;i<=4;i++){
    reqs.length=0;
    // real movement: down, then up in stages, so scroll events actually fire
    await page.evaluate(()=>{const sc=document.querySelector('[data-qa-scroller]'); if(sc) sc.scrollTop=1500;});
    await page.waitForTimeout(1200);
    for (const t of [900,400,120,0]) {
      await page.evaluate((t)=>{const sc=document.querySelector('[data-qa-scroller]'); if(sc) sc.scrollTop=t;},t);
      await page.waitForTimeout(900);
    }
    await page.waitForTimeout(5000);
    steps.push({step:'up-scroll #'+i, ...(await snap()), fetched:reqs.slice(0,2)});
  }
  page.off('request',onReq);
  return steps;
};
