const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const runSearch = async (ws, q) => {
    await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5000);
    const sb = page.locator('input[placeholder^="Search "], button[aria-label^="Search "]').first();
    if(!(await sb.count())) return {noSearch:true};
    await sb.click(); await page.waitForTimeout(1500);
    await page.keyboard.type(q,{delay:45}); await page.waitForTimeout(3000);
    return await page.evaluate((vs)=>{const vis=eval(vs);
      const body=document.body.innerText.replace(/\s+/g,' ');
      return { placeholder:[...document.querySelectorAll('input')].filter(vis).map(i=>i.placeholder).filter(Boolean)[0]||null,
        resultLine:(body.match(/Showing \d+ results?[^]{0,40}/)||[''])[0],
        counts:(body.match(/(All|Messages|Channels|People|Files) \d+/g)||[]).slice(0,5),
        typedValue:[...document.querySelectorAll('input')].filter(vis).map(i=>i.value).filter(Boolean)[0]||null };},VS);
  };
  out.ws1 = await runSearch('W4QAF1XTURESO01','V60');
  // now go to workspace 2 and open search fresh
  out.ws2 = await runSearch('W4OV431T9GS61M5','V60');
  return out;
};
