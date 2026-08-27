export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const state=()=>page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const num=(e)=>{const m=(e.innerText||'').match(/QA-DEEP-(\d{4})/); return m?+m[1]:null;};
    const nums=els.map(num).filter(n=>n!==null);
    return {loaded:els.length, oldest:nums.length?Math.min(...nums):null,
      newest:nums.length?Math.max(...nums):null};});
  const box=await page.locator('main').boundingBox();
  const cx=Math.round(box.x+box.width/2), cy=Math.round(box.y+box.height/2);
  await page.mouse.move(cx,cy);
  const series=[await state()];
  let stalls=0;
  for(let i=0;i<120 && stalls<12;i++){
    await page.mouse.wheel(0,-1400);
    await page.waitForTimeout(420);
    const s=await state();
    const prev=series[series.length-1];
    if(s.loaded===prev.loaded && s.oldest===prev.oldest) stalls++; else stalls=0;
    series.push(s);
    if(s.oldest!==null && s.oldest<=4) break;
  }
  const key=(s)=>`${s.loaded}/${s.oldest}`;
  const changes=[]; let prev=null;
  for(const s of series){ if(key(s)!==prev){changes.push(s); prev=key(s);} }
  const last=series[series.length-1];
  return {wheelSteps:series.length-1, reachedTop: last.oldest!==null && last.oldest<=4,
    final:last, stalledFor:stalls, changes:changes.slice(-12), changeCount:changes.length};
};
