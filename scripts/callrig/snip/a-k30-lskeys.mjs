export default async ({ page }) => {
  return await page.evaluate(() => {
    const out = {};
    for (let i=0;i<localStorage.length;i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      if (/device|audio|mic|speaker|camera|preference/i.test(k+v)) out[k] = v.slice(0, 260);
    }
    return { matched: out, allKeys: Object.keys(localStorage) };
  });
};
