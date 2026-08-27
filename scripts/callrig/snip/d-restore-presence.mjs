/* Lane D helper: put the driven account's Online status list back to "Workspace members"
 * after the presence repro, so a later measurement is not read through a leftover. */
const WS = 'W4QDF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const cbs = [...document.querySelectorAll('main [role="combobox"]')].filter(e => e.tagName === 'BUTTON');
    const t = cbs.find(e => { let n = e;
      for (let i = 0; i < 8 && n; i++) { n = n.parentElement;
        const s = (n && typeof n.innerText === 'string') ? n.innerText.trim() : '';
        if (s.startsWith('Online status')) return true; }
      return false; });
    t && t.setAttribute('data-qa', 'onlineStatus');
  });
  const before = await page.evaluate(() => document.querySelector('main [data-qa="onlineStatus"]')?.innerText.trim());
  await page.locator('[data-qa="onlineStatus"]').click({ timeout: 6000 });
  await page.waitForTimeout(1300);
  await page.evaluate(() => {
    const lb = [...document.querySelectorAll('[role="listbox"]')].pop();
    if (!lb) return;
    const leaf = [...lb.querySelectorAll('*')].find(e => e.children.length === 0
      && typeof e.innerText === 'string' && e.innerText.trim() === 'Workspace members');
    if (!leaf) return;
    let n = leaf;
    for (let i = 0; i < 4 && n; i++) { if (n.getAttribute('role') || getComputedStyle(n).cursor === 'pointer') break; n = n.parentElement; }
    (n || leaf).click();
  });
  await page.waitForTimeout(2400);
  const after = await page.evaluate(async () => {
    const me = await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json();
    const d = me.data || me;
    return { list: document.querySelector('main [data-qa="onlineStatus"]')?.innerText.trim(),
             stored: d.settings && d.settings.privacy && d.settings.privacy.online_visibility };
  });
  return { before, after };
};
