export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-people-toggle"]');
  const pressed = await t.getAttribute('aria-pressed');
  if (pressed !== 'true') { await t.click(); await page.waitForTimeout(3000); }
  return await page.evaluate(() => {
    const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const tids=[...new Set([...s.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].filter(x=>/people|particip|wait|panel/i.test(x));
    const all=[...s.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,34)}#${b.getAttribute('data-testid')||'-'}`);
    return {tids, text: s.innerText.replace(/\n+/g,' | ').slice(0,800), buttons: all.slice(0,40),
            bulk: all.filter(x=>/all/i.test(x))};
  });
};
