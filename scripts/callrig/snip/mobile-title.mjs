export default async ({page}) => {
  const out = [];
  for (const w of [1920, 768, 430, 390, 360, 320]) {
    await page.setViewportSize({width:w, height:844});
    await page.waitForTimeout(2200);
    out.push(await page.evaluate((w) => {
      const bar = document.querySelector('[data-testid="call-top-bar"]');
      if (!bar) return {w, noBar:true};
      const leaves = [...bar.querySelectorAll('*')].filter(e=>e.children.length===0 && e.textContent.trim());
      const title = leaves.find(e=>/QA Channel Call/.test(e.textContent));
      return {w, barW: Math.round(bar.getBoundingClientRect().width),
        title: title? {txt:title.textContent.trim().slice(0,30), sw:title.scrollWidth, cw:title.clientWidth, visible: Math.round(title.getBoundingClientRect().width)}:null,
        barItems: leaves.map(e=>({t:e.textContent.trim().slice(0,22), w:Math.round(e.getBoundingClientRect().width)})).slice(0,8)};
    }, w));
  }
  await page.setViewportSize({width:1920, height:1062});
  await page.waitForTimeout(1200);
  return out;
};
