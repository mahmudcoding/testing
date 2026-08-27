export default async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8731/index.html', { waitUntil:'networkidle' });
  await page.waitForTimeout(1500);
  return await page.evaluate(() => {
    const de=document.documentElement;
    const wide=[...document.querySelectorAll('pre,table,code,div')]
      .filter(e=>e.scrollWidth>e.clientWidth+2)
      .map(e=>({tag:e.tagName.toLowerCase(), cls:(e.className||'').toString().slice(0,24),
                sw:e.scrollWidth, cw:e.clientWidth,
                ox:getComputedStyle(e).overflowX}));
    const overflowingPage = de.scrollWidth > de.clientWidth;
    // any element wider than the viewport?
    const spill=[...document.querySelectorAll('*')]
      .filter(e=>e.getBoundingClientRect().right > innerWidth + 2)
      .map(e=>({tag:e.tagName.toLowerCase(), cls:(e.className||'').toString().slice(0,26),
                right:Math.round(e.getBoundingClientRect().right)})).slice(0,6);
    return { viewport:innerWidth, docScrollWidth:de.scrollWidth, docClientWidth:de.clientWidth,
             pageScrollsSideways: overflowingPage,
             wideBlocks: wide.length,
             wideBlocksScrollThemselves: wide.filter(w=>w.ox==='auto'||w.ox==='scroll').length,
             wideSample: wide.slice(0,5), spill,
             articles: document.querySelectorAll('article').length,
             h2s: document.querySelectorAll('h2').length };
  });
};
