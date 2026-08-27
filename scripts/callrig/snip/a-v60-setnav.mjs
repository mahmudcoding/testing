export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  return await page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return false;
      let n = el, op = 1;
      while (n && n !== document.documentElement) { op *= parseFloat(getComputedStyle(n).opacity || '1'); n = n.parentElement; }
      return op > 0.05;
    };
    const nav = [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a => ({
      label: (a.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40),
      href: (a.getAttribute('href') || '').split('/settings/')[1] || '',
      hasIcon: !!a.querySelector('svg'),
    }));
    const inputs = [...document.querySelectorAll('input[type="search"],input[placeholder]')].filter(vis)
      .map(i => ({ ph: i.placeholder.slice(0, 40), type: i.type, tid: i.getAttribute('data-testid') || '' }));
    return { url: location.pathname, navCount: nav.length, nav, filterInputs: inputs, lang: document.documentElement.lang };
  });
};
