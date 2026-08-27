export default async ({ page }) => {
  const info = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/^(Mute|Unmute)$/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    if (!b) return 'NOT-FOUND';
    const descId = b.getAttribute('aria-describedby');
    const desc = descId ? (document.getElementById(descId)||{}).innerText : null;
    // any nearby text mentioning the host/blocked
    let ctx = null, n = b, h = 0;
    while (n && h < 5) { n = n.parentElement; h++;
      if (n && /host|blocked|disabled|not allowed|permission/i.test(n.innerText||'')) { ctx = n.innerText.replace(/\n+/g,' | ').slice(0,150); break; } }
    return { title: b.getAttribute('title'), ariaLabel: b.getAttribute('aria-label'),
             describedBy: desc, disabled: b.disabled, nearbyExplanation: ctx,
             bodyMentions: /mic.{0,40}(blocked|disabled|host)|host.{0,40}(blocked|muted).{0,20}mic/i.test(document.body.innerText) };
  });
  // hover to reveal a tooltip
  const box = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/^(Mute|Unmute)$/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    if (!b) return null; const r = b.getBoundingClientRect();
    return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) }; });
  let tooltip = null;
  if (box) { await page.mouse.move(box.x, box.y); await page.waitForTimeout(1800);
    tooltip = await page.evaluate(() => [...document.querySelectorAll('[role="tooltip"],[data-radix-popper-content-wrapper]')]
      .filter(e=>e.getBoundingClientRect().width>0).map(e=>e.innerText.replace(/\n+/g,' ').slice(0,120))); }
  return { info, tooltip };
};
