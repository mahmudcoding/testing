export default async ({ page }) => {
  return await page.evaluate(async () => {
    const ws = location.pathname.split('/')[2];
    const r1 = await fetch(`/api/v1/workspace/${ws}/meetings/active`, {credentials:'include'});
    const r2 = await fetch(`/api/v1/meetings/current`, {credentials:'include'});
    const surf = document.querySelector('[class*="call-surface"],[data-testid*="call"]');
    return { active: (await r1.text()).slice(0,400), current: (await r2.text()).slice(0,300),
             tiles: document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]').length,
             hasLeave: !!Array.from(document.querySelectorAll('button')).find(b=>/^Leave call$/.test(b.textContent.trim())) };
  });
};
