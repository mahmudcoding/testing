export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const all = [...document.querySelectorAll('button,[role="button"]')].filter(v);
    return { banner: [...document.querySelectorAll('[data-testid^="incoming-call"]')].filter(v)
               .map(e=>e.getAttribute('data-testid')),
             matched: all.filter(b => /accept|decline|answer|ringing/i.test(
               (b.getAttribute('data-testid')||'') + ' ' + (b.getAttribute('aria-label')||'') + ' ' + b.textContent))
               .map(b=>({tid:b.getAttribute('data-testid'), t:b.textContent.trim().slice(0,20)})) };
  });
};
