export default async ({page}) => {
  await page.setViewportSize({width:360, height:800});
  await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const bar=document.querySelector('[data-testid="call-top-bar"]');
    const nameNodes=[...s.querySelectorAll('*')].filter(e=>e.children.length===0 && /QA Channel Call/.test(e.textContent))
      .map(e=>{const rc=e.getBoundingClientRect(); return {w:Math.round(rc.width), h:Math.round(rc.height), tid:(e.closest('[data-testid]')||{}).getAttribute?.('data-testid'), visible: rc.width>0&&rc.height>0};});
    return {surfaceText: s.innerText.replace(/\n+/g,' | ').slice(0,300),
            barText: bar? bar.innerText.replace(/\n+/g,' | ').slice(0,120):null,
            nameNodes,
            barChildren: bar? [...bar.children].map(c=>({tag:c.tagName, w:Math.round(c.getBoundingClientRect().width), txt:c.innerText.replace(/\n+/g,' ').slice(0,30)})):[]};
  });
  await page.setViewportSize({width:1920, height:1062});
  await page.waitForTimeout(1200);
  return r;
};
