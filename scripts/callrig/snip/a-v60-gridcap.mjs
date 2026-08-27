const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.keyboard.press('Escape').catch(()=>{});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV2MX4P25ZSKK',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.grid = await page.evaluate((vs)=>{const vis=eval(vs);
    return { capText:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/show more|showing|hidden|\+\d+ more|of \d+/i.test(e.innerText||''))
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44)).slice(0,6),
      gridBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,26)).filter(a=>/grid|view|show more|layout/i.test(a)),
      videoCount:document.querySelectorAll('video').length };},VS);
  // switch to grid view and re-check
  const g = page.locator('button[aria-label="Grid view"]').first();
  if(await g.count()){ await g.click(); await page.waitForTimeout(3500);
    out.afterGrid = await page.evaluate((vs)=>{const vis=eval(vs);
      return { capText:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/show more|showing|hidden|\+\d+ more/i.test(e.innerText||''))
          .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44)).slice(0,5),
        videoCount:document.querySelectorAll('video').length,
        viewBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').slice(0,22)).filter(a=>/view/i.test(a)) };},VS); }
  return out;
};
