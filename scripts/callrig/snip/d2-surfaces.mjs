export default async ({ page }) => {
  const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
  const probe = () => page.evaluate(`(() => { const t = document.body.innerText;
    return { phone:/998 90 123/.test(t), linkedin:/qa-probe/.test(t), site:/example\\.org/.test(t) }; })()`);
  const res = {};

  // 1. DM with Alice
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  try {
    const row = page.locator('button[aria-label="Open QA Alice\'s profile"]').first();
    await row.scrollIntoViewIfNeeded();
    const msg = page.locator('button:has-text("Message")').nth(1);
    await msg.scrollIntoViewIfNeeded(); await msg.click(); await page.waitForTimeout(3500);
    res.dmPath = page.url().replace(/^https?:\/\/[^/]+/, '');
    res.dmHeader = await probe();
    // click the conversation header title to see if a profile opens
    const hdr = await page.evaluate(`(() => { const vis = ${VIS};
      const h = [...document.querySelectorAll('header button, header [role=button], main header *')].filter(vis)
        .map(e => (e.getAttribute('aria-label')||e.innerText||'').trim()).filter(Boolean).slice(0,12); return h; })()`);
    res.dmHeaderControls = hdr;
  } catch (e) { res.dmErr = e.message.slice(0, 90); }

  // 2. hover/click author avatar in qa-general
  try {
    await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDGENERAL0001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);
    const av = page.locator('[data-message-id] button[aria-label*="Alice"]').first();
    const n = await page.locator('[data-message-id] button[aria-label*="Alice"]').count();
    res.authorButtons = n;
    if (n) { await av.scrollIntoViewIfNeeded(); await av.click(); await page.waitForTimeout(2500); }
    res.afterAuthorClick = await probe();
    res.openPanels = await page.evaluate(`(() => { const vis = ${VIS};
      return [...document.querySelectorAll('[role=dialog],aside,[data-radix-popper-content-wrapper]')].filter(vis)
        .map(e => (e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,150)).filter(Boolean).slice(0,4); })()`);
  } catch (e) { res.msgErr = e.message.slice(0, 90); }
  return res;
};
