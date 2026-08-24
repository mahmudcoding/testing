export default async ({page}) => {
  const sw = await page.$$('main [role="switch"]');
  if (!sw.length) return {err:'none'};
  await sw[0].click();   // Push to talk
  await page.waitForTimeout(1500);
  await sw[1].click();   // nerd stats
  await page.waitForTimeout(1500);
  return await page.evaluate(()=>[...document.querySelectorAll('main [role="switch"]')].map(s=>s.getAttribute('aria-checked')));
};
