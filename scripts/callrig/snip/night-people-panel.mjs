export default async ({page}) => {
  // close settings if open
  const s = page.locator('[data-testid="call-controls-settings-toggle"]');
  if (await s.count() && await s.getAttribute('aria-pressed') === 'true') { await s.click(); await page.waitForTimeout(1500); }
  const t = page.locator('[data-testid="call-controls-people-toggle"]');
  const badgeBefore = await t.innerText().catch(()=>null);
  if (await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(() => {
    const panel = [...document.querySelectorAll('aside,[role="dialog"]')].pop() || document.body;
    return {
      panelTestid: panel.getAttribute && panel.getAttribute('data-testid'),
      text: panel.innerText.replace(/\n+/g,' | ').slice(0,1200),
      buttons: [...panel.querySelectorAll('button')].map(b=>({
        l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,42), t:b.getAttribute('data-testid'), d:b.disabled})),
      tabs: [...panel.querySelectorAll('[role="tab"]')].map(e=>({l:e.textContent.trim().slice(0,30), sel:e.getAttribute('aria-selected')}))
    };
  });
};
