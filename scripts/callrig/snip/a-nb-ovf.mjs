export default async ({page}) => {
  await page.goto('http://127.0.0.1:8899/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2000);
  return await page.evaluate(()=>[...document.querySelectorAll('p,li,td,h2')]
    .filter(e=>e.scrollWidth>e.clientWidth+1)
    .map(e=>({tag:e.tagName.toLowerCase(), sw:e.scrollWidth, cw:e.clientWidth,
      ovf:getComputedStyle(e).overflowX, txt:(e.textContent||'').replace(/\s+/g,' ').slice(0,110)})));
};
