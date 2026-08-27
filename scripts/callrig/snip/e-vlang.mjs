const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const controls = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const m = document.querySelector('main') || document.body;
    return {
      selects: [...m.querySelectorAll('select')].filter(vis).map(s => ({ al: s.getAttribute('aria-label'), val: s.value, opts: [...s.options].map(o => `${o.value}:${o.text}`).slice(0, 8) })),
      langish: [...m.querySelectorAll('button,select,[role=combobox]')].filter(vis)
        .map(b => ({ tag: b.tagName, al: b.getAttribute('aria-label'), txt: (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) }))
        .filter(x => /lang|english|русск|russ/i.test((x.al || '') + ' ' + x.txt)).slice(0, 8),
    };
  });
  return controls;
};
