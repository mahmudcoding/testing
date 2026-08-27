export default async ({ page }) => {
  const out=[];
  for (const w of [1280, 1600, 1920]) {
    await page.setViewportSize({ width:w, height:900 });
    await page.goto('http://127.0.0.1:8731/index.html', { waitUntil:'networkidle' });
    await page.waitForTimeout(900);
    out.push(await page.evaluate(() => {
      const de=document.documentElement;
      const wide=[...document.querySelectorAll('pre')].filter(e=>e.scrollWidth>e.clientWidth+2);
      return { w:innerWidth, sideways:de.scrollWidth>de.clientWidth,
               wide:wide.length, allAuto:wide.every(e=>['auto','scroll'].includes(getComputedStyle(e).overflowX)) };
    }));
  }
  return out;
};
