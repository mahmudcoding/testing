const CALL='V4OV71VVGQMD1YE';
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto(`https://airion-cargo.store/w/W4QAF1XTURESO01/call/${CALL}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  for(const l of ['Join now','Join call','Join']){
    const b=page.locator('button',{hasText:new RegExp('^'+l+'$')}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.clicked=l; await page.waitForTimeout(6000); break; }
  }
  out.state = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname.slice(-18),
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,90) };},VS);
  return out;
};
