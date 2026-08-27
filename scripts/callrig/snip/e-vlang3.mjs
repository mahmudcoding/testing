const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const bellSel = 'button[aria-label^="Notifications"], button[aria-label^="Уведомл"]';
  const bell = await page.$(bellSel);
  const bellLabel = bell ? await bell.evaluate(el => el.getAttribute('aria-label')) : null;
  if (bell) { await bell.click(); await page.waitForTimeout(2500); }
  const out = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const p = [...document.querySelectorAll('[role="dialog"],aside')].filter(vis).sort((a, b) => b.innerText.length - a.innerText.length)[0];
    const t = p ? (p.innerText || '').replace(/\s+/g, ' ').trim() : '';
    return {
      chromeRussian: /Уведомления/.test(t),
      titleStillEnglish: /Meeting invitation/.test(t),
      titleRussianAnywhere: /приглашени/i.test(t),
      bodyStillEnglish: /You've been invited to/.test(t),
      snippet: t.slice(0, 300),
    };
  });
  return { bellLabel, ...out };
};
