export default async ({ page }) => {
  const t = await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect();
      if (r.width===0||r.height===0) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) {
        o *= parseFloat(getComputedStyle(n).opacity || '1'); n = n.parentElement; }
      return o > 0.05; };
    const all = Array.from(document.querySelectorAll('body *')).filter(vis);
    const root = all.find(n => /PARTICIPANTS/.test(n.textContent) &&
      !all.some(o => o !== n && n.contains(o) && /PARTICIPANTS/.test(o.textContent)));
    return root ? root.innerText : '(no PARTICIPANTS block)';
  });
  return { participants: t };
};
