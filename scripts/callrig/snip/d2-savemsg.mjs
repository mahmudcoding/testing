const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDGENERAL0001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  const msg = page.locator('[data-message-id]').last();
  await msg.scrollIntoViewIfNeeded(); await msg.hover(); await page.waitForTimeout(1200);
  const actions = await page.evaluate(`(() => { const vis = ${VIS};
    return [...document.querySelectorAll('[data-message-id] button, [role=toolbar] button')].filter(vis)
      .map(b => (b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,40)).filter(Boolean)
      .filter((v,i,a)=>a.indexOf(v)===i).slice(0,14); })()`);
  const before = await page.evaluate(() => localStorage.getItem('aloqa.saved-messages.v2.U4QDALICE000001')||'(none)');
  // click a save/bookmark action if present
  let clicked = null;
  for (const pat of ['Save message','Save for later','Bookmark','Save']) {
    const b = page.locator(`button[aria-label="${pat}"]`).first();
    if (await b.count()) { await b.scrollIntoViewIfNeeded(); await b.click(); clicked = pat; await page.waitForTimeout(2200); break; }
  }
  const after = await page.evaluate(() => localStorage.getItem('aloqa.saved-messages.v2.U4QDALICE000001')||'(none)');
  return { hoverActions: actions, clicked, savedCacheBefore: before.slice(0,180), savedCacheAfter: after.slice(0,180) };
};
