export default async ({page}) => {
  const hit = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(x=>x.offsetParent)
      .find(x => /turn camera off/i.test(x.getAttribute('aria-label')||''));
    if (b) { b.click(); return b.getAttribute('aria-label'); }
    return 'not found';
  });
  await page.waitForTimeout(6000);
  return { hit, videos: await page.evaluate(()=>document.querySelectorAll('video').length) };
};
