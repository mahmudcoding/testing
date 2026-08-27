export default async ({ page }) => {
  const names = (process.env.QA_NAMES || '').split('|').filter(Boolean);
  return await page.evaluate((names) => {
    const t = document.body.innerText || '';
    const o = { url: location.pathname };
    for (const n of names) o[n] = t.includes(n);
    return o;
  }, names);
};
