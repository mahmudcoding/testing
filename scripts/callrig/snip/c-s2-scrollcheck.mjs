const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(10000);
  // tag the scroll container so we always measure the SAME element
  const tagged = await page.evaluate(()=>{
    let sc=null;
    for (const e of document.querySelectorAll('div')) {
      if (e.scrollHeight>e.clientHeight+40 && e.clientHeight>300 && e.querySelector('[data-message-id]')) { sc=e; break; } }
    if(!sc) return null;
    sc.setAttribute('data-qa-scroll','1');
    const r=sc.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), top:Math.round(sc.scrollTop), h:Math.round(sc.scrollHeight), ch:Math.round(sc.clientHeight)};
  });
  const read=(t)=>page.evaluate((tag)=>{
    const sc=document.querySelector('[data-qa-scroll="1"]');
    return {tag, present:!!sc, top: sc?Math.round(sc.scrollTop):null, h: sc?Math.round(sc.scrollHeight):null,
      ch: sc?Math.round(sc.clientHeight):null, n:document.querySelectorAll('[data-message-id]').length};
  }, t);
  const out={tagged, steps:[]};
  out.steps.push(await read('start'));
  // wheel up 6 times
  for (let i=0;i<6;i++){ await page.mouse.move(tagged.x, tagged.y); await page.mouse.wheel(0,-900); await page.waitForTimeout(600); }
  await page.waitForTimeout(2500);
  out.steps.push(await read('after-wheel-up'));
  // wheel down 10 times (to the bottom)
  for (let i=0;i<10;i++){ await page.mouse.move(tagged.x, tagged.y); await page.mouse.wheel(0, 900); await page.waitForTimeout(500); }
  await page.waitForTimeout(2500);
  out.steps.push(await read('after-wheel-down'));
  // now wheel up again — the case that looked frozen
  for (let i=0;i<6;i++){ await page.mouse.move(tagged.x, tagged.y); await page.mouse.wheel(0,-900); await page.waitForTimeout(600); }
  await page.waitForTimeout(2500);
  out.steps.push(await read('after-second-wheel-up'));
  // and programmatic scroll as a control
  await page.evaluate(()=>{ const sc=document.querySelector('[data-qa-scroll="1"]'); if(sc) sc.scrollTop=0; });
  await page.waitForTimeout(2500);
  out.steps.push(await read('after-programmatic-top'));
  return out;
};
