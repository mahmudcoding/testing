export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-settings-toggle"]');
  if (await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(() => {
    const panel = document.querySelector('[data-testid*="settings"][data-testid*="panel"]')
      || [...document.querySelectorAll('aside,[role="dialog"]')].pop() || document.body;
    return {
      testid: panel.getAttribute && panel.getAttribute('data-testid'),
      text: panel.innerText.replace(/\n+/g,' | ').slice(0,1800),
      controls: [...panel.querySelectorAll('button,input,select,[role="switch"],[role="radio"],[role="slider"]')].map(e=>({
        tag: e.tagName.toLowerCase(),
        role: e.getAttribute('role'),
        l: (e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||'').trim().slice(0,45),
        t: e.getAttribute('data-testid'),
        checked: e.getAttribute('aria-checked'),
        val: e.value !== undefined ? String(e.value).slice(0,30) : undefined,
        d: e.disabled
      })).slice(0,60)
    };
  });
};
