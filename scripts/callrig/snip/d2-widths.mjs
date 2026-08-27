export default async ({ page }) => {
  const out={};
  for (const w of [1280,1600,1920]) {
    await page.setViewportSize({ width:w, height:900 });
    await page.goto('http://127.0.0.1:8731/', { waitUntil:'networkidle' });
    await page.waitForTimeout(1200);
    out[w] = await page.evaluate(`(() => {
      const de=document.documentElement;
      const wide=[...document.querySelectorAll('pre,table')];
      const spill=wide.filter(e=>{
        const s=getComputedStyle(e.parentElement||e);
        return e.scrollWidth>e.clientWidth && !/auto|scroll/.test(s.overflowX)
               && !/auto|scroll/.test(getComputedStyle(e).overflowX); }).length;
      return { pageScrollsSideways: de.scrollWidth > de.clientWidth,
               docWidth: de.scrollWidth, viewport: de.clientWidth,
               wideBlocks: wide.length, blocksThatSpill: spill,
               articles: document.querySelectorAll('article').length }; })()`);
  }
  await page.setViewportSize({ width:1280, height:900 });
  return out;
};
