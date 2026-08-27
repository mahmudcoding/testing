export default async ({ page }) => {
  // deliberately NO goto / NO reload — read the page as it has been sitting
  const read = () => page.evaluate(() => {
    const main=document.querySelector('main');
    const t=(main?.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('QA Carol');
    return { url: location.pathname,
      carolRegion: i>=0 ? t.slice(i, i+70) : '(carol not found)',
      mentionsProbe: /LiveProbe/.test(t) };
  });
  const first = await read();
  await page.waitForTimeout(30000);          // the ticket's own 30-second wait
  const after30 = await read();
  return { immediately: first, after30s: after30 };
};
