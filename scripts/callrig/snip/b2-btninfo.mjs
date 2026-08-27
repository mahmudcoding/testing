export default async ({ page }) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return [...document.querySelectorAll('button')].filter(v)
      .filter(b=>/call/i.test((b.getAttribute('aria-label')||'')))
      .map(b=>({ al:b.getAttribute('aria-label'), title:b.getAttribute('title'),
                 tid:b.getAttribute('data-testid'), disabled:b.disabled,
                 svgTitles:[...b.querySelectorAll('title')].map(t=>t.textContent).slice(0,2),
                 cls:(b.className||'').toString().slice(0,50) }));
  });
};
