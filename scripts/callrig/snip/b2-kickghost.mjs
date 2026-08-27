export default async ({ page }) => {
  // open the ghost's tile menu
  const opened = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const tiles = [...document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]')].filter(v);
    const g = tiles.find(t => /GUEST/i.test(t.innerText||''));
    if (!g) return 'no guest tile';
    const trig = g.querySelector('[data-testid="participant-tile-card-trigger"]') || g;
    trig.click(); return 'opened';
  });
  await page.waitForTimeout(2500);
  const menu = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return [...document.querySelectorAll('[role="menuitem"],[role="dialog"] button,button')].filter(v)
      .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30), al:(b.getAttribute('aria-label')||'').slice(0,30)}))
      .filter(b=>/remove|kick|ban|guest|leak/i.test(b.t + ' ' + b.al)).slice(0,10);
  });
  return { opened, moderationOptions: menu };
};
