export default async ({page}) => {
  const f='file:///private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/view/report.html';
  await page.setViewportSize({width:1280,height:900});
  await page.goto(f, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  const light = await page.evaluate(()=>{
    const d=document.documentElement;
    const leaves=[...document.querySelectorAll('*')].filter(e=>e.children.length===0);
    const clipped=leaves.filter(e=>e.scrollWidth>e.clientWidth+1 && e.clientWidth>1)
      .map(e=>({tag:e.tagName, t:(e.textContent||'').trim().slice(0,30), sw:e.scrollWidth, cw:e.clientWidth}));
    const pre=[...document.querySelectorAll('pre')];
    const preOverflowing=pre.filter(e=>e.scrollWidth>e.clientWidth+1).length;
    const preScrollable=pre.filter(e=>getComputedStyle(e).overflowX==='auto'||getComputedStyle(e).overflowX==='scroll').length;
    return {pageHScroll:d.scrollWidth-d.clientWidth, docHeight:d.scrollHeight,
      articles:document.querySelectorAll('article').length,
      rows:document.querySelectorAll('tbody tr, table tr').length,
      preTotal:pre.length, preOverflowing, preScrollable,
      clippedCount:clipped.length, clipped:clipped.slice(0,5),
      bodyBg:getComputedStyle(document.body).backgroundColor,
      bodyColor:getComputedStyle(document.body).color,
      h1:(document.querySelector('h1')||{textContent:''}).textContent.trim().slice(0,50)};
  });
  await page.emulateMedia({colorScheme:'dark'});
  await page.waitForTimeout(1200);
  const dark = await page.evaluate(()=>({
    bodyBg:getComputedStyle(document.body).backgroundColor,
    bodyColor:getComputedStyle(document.body).color,
    articleBg:getComputedStyle(document.querySelector('article')).backgroundColor,
    preBg:getComputedStyle(document.querySelector('pre')).backgroundColor,
    preColor:getComputedStyle(document.querySelector('pre')).color}));
  await page.emulateMedia({colorScheme:'light'});
  return {light, dark};
};
