const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const sb = page.locator('input[placeholder="Search QA Workspace"], button[aria-label="Search QA Workspace"]').first();
  out.searchFound = await sb.count()>0;
  if(!out.searchFound) return out;
  await sb.click(); await page.waitForTimeout(1500);
  await page.keyboard.type('V60-COPY',{delay:50});
  await page.waitForTimeout(3000);
  out.afterType = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname+location.search,
      results:[...document.querySelectorAll('[role="dialog"] *,[role="listbox"] *')].filter(e=>vis(e)&&e.children.length===0&&/V60/.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,44)).slice(0,5),
      btns:[...document.querySelectorAll('[role="dialog"] button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,10) };},VS);
  // press Enter -> Full Search
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  out.afterEnter = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname+location.search,
      mainTxt:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,220),
      tabs:[...document.querySelectorAll('[role="tab"],button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,20)).filter(t=>/messages|files|people|channels|all/i.test(t)).slice(0,8) };},VS);
  // reload to check the query survives in the URL
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000);
  out.afterReload = await page.evaluate(()=>({url:location.pathname+location.search,
    mainTxt:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,200)}));
  return out;
};
