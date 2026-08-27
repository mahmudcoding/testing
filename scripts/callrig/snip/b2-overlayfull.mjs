export default async ({ page }) => {
  return await page.evaluate(() => {
    const d = document.querySelector('[data-testid="call-ended-overlay"]');
    if (!d) return 'no overlay';
    const t = (d.innerText||'');
    return { len: t.length, full: t.replace(/\n+/g,' | '),
             hasPing1: t.includes('ping one'), hasPing2: t.includes('ping two') };
  });
};
