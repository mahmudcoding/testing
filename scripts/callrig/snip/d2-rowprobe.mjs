export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; };
    // find the smallest visible element whose text contains QA Alice
    const all = [...document.querySelectorAll('main *')].filter(vis).filter(e => /QA Alice/.test(e.innerText || ''));
    const row = all.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)
      .find(e => (e.innerText || '').length > 8 && (e.innerText || '').length < 120)
      || all[all.length - 1];
    if (!row) return { err: 'no row' };
    let holder = row; for (let i = 0; i < 4 && holder.parentElement; i++) { if (holder.querySelectorAll('button,a').length >= 2) break; holder = holder.parentElement; }
    const items = [...holder.querySelectorAll('button,a,[role=button],img,[data-testid]')].filter(vis).map(e => ({
      tag: e.tagName.toLowerCase(), label: (e.getAttribute('aria-label') || e.innerText || e.getAttribute('alt') || '').trim().slice(0, 40),
      testid: e.getAttribute('data-testid') || '', href: (e.getAttribute('href') || '').slice(0, 60),
      cursor: getComputedStyle(e).cursor
    }));
    return { rowText: (holder.innerText || '').replace(/\s+/g, ' ').slice(0, 120), rowTag: holder.tagName.toLowerCase(),
             rowCursor: getComputedStyle(holder).cursor, items };
  });
};
