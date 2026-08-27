export default async ({page}) => {
  const hit = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].filter(b=>b.offsetParent);
    const cam = btns.find(b => /camera|video/i.test((b.getAttribute('aria-label')||'')) && !/share/i.test(b.getAttribute('aria-label')||''));
    if (cam) { cam.click(); return (cam.getAttribute('aria-label')||'') + ' | testid=' + cam.getAttribute('data-testid'); }
    return 'no camera button; labels=' + JSON.stringify(btns.map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28)).filter(Boolean).slice(0,30));
  });
  await page.waitForTimeout(5000);
  return { hit, videos: await page.evaluate(()=>document.querySelectorAll('video').length) };
};
