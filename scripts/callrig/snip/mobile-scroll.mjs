export default async ({page}) => {
  const before = await page.evaluate(() => {
    const b=[...document.querySelectorAll('[data-testid="call-toolbar"] button')].find(x=>(x.getAttribute('aria-label')||'')==='More');
    const r=b.getBoundingClientRect(); return {x:Math.round(r.x), reachable: r.left < innerWidth};
  });
  // scroll the inner strip like a user swiping
  await page.evaluate(() => {
    const b=[...document.querySelectorAll('[data-testid="call-toolbar"] button')].find(x=>(x.getAttribute('aria-label')||'')==='More');
    const strip=b.parentElement; strip.scrollLeft = strip.scrollWidth;
  });
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => {
    const b=[...document.querySelectorAll('[data-testid="call-toolbar"] button')].find(x=>(x.getAttribute('aria-label')||'')==='More');
    const r=b.getBoundingClientRect();
    const hit=document.elementFromPoint(Math.round(r.left+r.width/2), Math.round(r.top+r.height/2));
    return {x:Math.round(r.x), reachable: r.left<innerWidth && r.right<=innerWidth,
            hitIsBtn: hit===b || b.contains(hit)};
  });
  // clipped-text check on the header at mobile width
  const clip = await page.evaluate(() => {
    const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return [...s.querySelectorAll('*')].filter(e=>e.children.length===0 && e.scrollWidth>e.clientWidth+1 && e.clientWidth>4)
      .map(e=>({t:e.textContent.trim().slice(0,40), sw:e.scrollWidth, cw:e.clientWidth, tid:(e.closest('[data-testid]')||{}).getAttribute?.('data-testid')})).slice(0,8);
  });
  await page.setViewportSize({width:1920, height:1062});
  await page.waitForTimeout(1500);
  return {before, after, clippedAtMobile: clip};
};
