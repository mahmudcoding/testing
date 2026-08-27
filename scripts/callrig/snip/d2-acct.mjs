export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const vis = el => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1;
      while (n && n !== document.documentElement) {
        const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false;
        o *= parseFloat(s.opacity); n = n.parentElement;
      }
      return o > 0.05;
    };
    const main = document.querySelector('main') || document.body;
    const out = [];
    main.querySelectorAll('input,textarea,select,button,a,[role=switch],[role=button],[contenteditable=true]').forEach(el => {
      if (!vis(el)) return;
      const r = el.getBoundingClientRect();
      out.push({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || el.getAttribute('role') || '',
        label: (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.innerText || '').trim().slice(0, 48),
        value: (el.value !== undefined ? String(el.value) : '').slice(0, 40),
        name: el.getAttribute('name') || el.id || '',
        disabled: el.disabled === true || el.getAttribute('aria-disabled') === 'true',
        ro: el.readOnly === true,
        y: Math.round(r.y)
      });
    });
    const heads = [...main.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h => h.innerText.trim().slice(0, 60));
    return { url: location.pathname, heads, count: out.length, controls: out };
  });
};
