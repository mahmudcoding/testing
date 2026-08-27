export default async ({ page }) => {
  const hit = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = document.querySelector('[data-testid="call-ended-overlay"]');
    if (!d) return 'no overlay';
    const b = [...d.querySelectorAll('button,summary,[role="button"]')].filter(v)
      .find(x=>/show messages/i.test(x.innerText||''));
    if (!b) return 'no toggle';
    b.click(); return 'clicked'; });
  await page.waitForTimeout(2500);
  return { toggle: hit, after: await page.evaluate(() => {
    const d = document.querySelector('[data-testid="call-ended-overlay"]');
    const t = d ? d.innerText : '';
    return { hasPing1: t.includes('ping one'), hasPing2: t.includes('ping two'),
             tail: t.replace(/\n+/g,' | ').slice(-220) }; }) };
};
