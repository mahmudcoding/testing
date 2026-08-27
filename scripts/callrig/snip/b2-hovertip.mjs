export default async ({ page }) => {
  const box = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-controls-people-toggle"]');
    if (!b) return null; const r = b.getBoundingClientRect();
    return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2),
             title: b.getAttribute('title'), al: b.getAttribute('aria-label') }; });
  if (!box) return 'NOT-FOUND';
  await page.mouse.move(box.x, box.y); await page.waitForTimeout(2000);
  const tips = await page.evaluate(() => [...document.querySelectorAll('[role="tooltip"],[data-radix-popper-content-wrapper]')]
    .filter(e=>e.getBoundingClientRect().width>0).map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,90)));
  return { button: { title: box.title, ariaLabel: box.al }, visibleTooltips: tips };
};
