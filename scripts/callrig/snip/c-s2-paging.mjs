export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const reqs=[];
  const onReq=(r)=>{const u=r.url();
    if(u.includes('/api/v1/')&&/messages/.test(u)) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,70));};
  page.on('request',onReq);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  const findScroller=()=>page.evaluate(()=>{
    const m=document.querySelector('main [data-message-id]');
    if(!m) return null;
    let n=m.parentElement;
    while(n && n!==document.body){
      const s=getComputedStyle(n);
      if(n.scrollHeight>n.clientHeight+40 && /auto|scroll/.test(s.overflowY)){
        n.setAttribute('data-qa-scroller','1'); return true; }
      n=n.parentElement; }
    return false;});
  const found=await findScroller();
  const snap=()=>page.evaluate(()=>{
    const sc=document.querySelector('[data-qa-scroller]');
    return {msgs:document.querySelectorAll('main [data-message-id]').length,
      scrollTop:sc?Math.round(sc.scrollTop):null,
      scrollHeight:sc?Math.round(sc.scrollHeight):null,
      clientHeight:sc?Math.round(sc.clientHeight):null};});
  const steps=[{step:'initial', ...(await snap())}];
  for (let i=1;i<=3;i++){
    reqs.length=0;
    await page.evaluate(()=>{const sc=document.querySelector('[data-qa-scroller]'); if(sc) sc.scrollTop=0;});
    await page.waitForTimeout(6000);
    steps.push({step:'scrollTop=0 #'+i, ...(await snap()), reqs:reqs.slice(0,2)});
  }
  page.off('request',onReq);
  return {scrollerFound:found, steps};
};
