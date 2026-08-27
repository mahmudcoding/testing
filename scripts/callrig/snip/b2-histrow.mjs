export default async ({ page }) => {
  const ws = await page.evaluate(()=> location.pathname.split('/')[2]);
  await page.goto(`https://airion-cargo.store/w/${ws}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const me = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', {credentials:'include'}); const j = await r.json();
    return (j.user||j).email || (j.user||j).username; });
  const rows = await page.evaluate((needle) => {
    const nodes = Array.from(document.querySelectorAll('[data-testid*="history"], li, tr, [class*="history-item"], [class*="call-row"]'));
    const hits = nodes.filter(n => n.textContent.includes(needle) && n.getBoundingClientRect().height>0);
    // smallest containing element per match
    const min = hits.filter(n => !hits.some(o => o !== n && n.contains(o)));
    return min.map(n => n.innerText.replace(/\n+/g,' | ').trim());
  }, process.env.QA_NEEDLE || 'QA endurance');
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=5', {credentials:'include'});
    return (await r.text()).slice(0, 1400); });
  return { me, rows, apiFirstPage: api };
};
