const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV2MX4P25ZSKK',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  for(const l of ['Join now','Join call','Join']){
    const b=page.locator('button',{hasText:new RegExp('^'+l+'$')}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.clicked=l; await page.waitForTimeout(7000); break; }
  }
  out.state = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname.slice(0,44),
      hasLeave:[...document.querySelectorAll('button')].filter(vis).some(b=>/Leave call/i.test(b.getAttribute('aria-label')||b.innerText||'')),
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,170) };},VS);
  return out;
};
