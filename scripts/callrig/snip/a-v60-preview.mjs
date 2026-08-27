export default async ({ page }) => {
  await page.goto('file:///private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/preview/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/report-top.png'});
  const m = await page.evaluate(()=>({
    bodyScrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    overflowing: [...document.querySelectorAll('*')].filter(e=>e.scrollWidth>e.clientWidth+1&&e.children.length===0).map(e=>e.tagName+':'+(e.innerText||'').slice(0,26)).slice(0,6),
    articles: document.querySelectorAll('article').length, tables: document.querySelectorAll('table').length }));
  return m;
};
