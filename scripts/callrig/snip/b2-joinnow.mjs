export default async ({ page }) => {
  const net = [];
  page.on('response', r => { if (/\/api\/v1\/meeting/.test(r.url()))
    net.push({ st:r.status(), m:r.request().method(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,80) }); });
  const hit = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).filter(x=>x.getBoundingClientRect().width>0)
      .find(x => /^Join$/i.test(x.textContent.trim()) && !x.disabled);
    if (b) { b.click(); return true; } return false; });
  await page.waitForTimeout(6000);
  const after = await page.evaluate(() => ({
    tail: document.body.innerText.replace(/\n+/g,' | ').slice(-190),
    tiles: document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]').length,
    buttons: Array.from(document.querySelectorAll('button')).filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>b.textContent.trim().slice(0,26)).filter(Boolean).slice(-7) }));
  return { clicked: hit, net: net.slice(0,6), after };
};
