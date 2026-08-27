const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const sb = page.locator('input[placeholder="Search QA Workspace"], button[aria-label="Search QA Workspace"]').first();
  await sb.click(); await page.waitForTimeout(1400);
  await page.keyboard.type('V60-COPY',{delay:45});
  await page.waitForTimeout(3000);
  const see = page.locator('button', { hasText: /^See all in Messages$/ }).first();
  out.seeAllFound = await see.count()>0;
  if(!out.seeAllFound){
    out.btns = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)).filter(Boolean).slice(-12);},VS);
    return out;
  }
  await see.click(); await page.waitForTimeout(4000);
  out.fullSearch = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname+location.search,
      mainTxt:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,240) };},VS);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4500);
  out.afterReload = await page.evaluate(()=>({ url:location.pathname+location.search,
    mainTxt:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,240),
    queryInInputs:[...document.querySelectorAll('input')].map(i=>i.value).filter(Boolean).slice(0,4) }));
  return out;
};
