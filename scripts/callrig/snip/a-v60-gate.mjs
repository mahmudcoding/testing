const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV71VVGQMD1YE',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const pre = await page.evaluate((vs)=>{const vis=eval(vs);
    return { txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,240),
      pwField:[...document.querySelectorAll('input')].filter(vis).some(i=>i.type==='password'||/assword/i.test(i.placeholder||'')),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,20)).filter(Boolean).slice(-8) };},VS);
  for(const l of ['Join now','Join call','Join']){
    const b=page.locator('button',{hasText:new RegExp('^'+l+'$')}).first();
    if(await b.count()){ await b.click().catch(()=>{}); await page.waitForTimeout(7000); break; } }
  const post = await page.evaluate((vs)=>{const vis=eval(vs);
    return { txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,240),
      pwField:[...document.querySelectorAll('input')].filter(vis).some(i=>i.type==='password'||/assword/i.test(i.placeholder||'')),
      approvalWait:/waiting for host|approve/i.test(document.body.innerText||'') };},VS);
  return { lobby:pre, afterJoin:post };
};
