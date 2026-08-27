export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-live-reaction"]');
  await t.click();
  await page.waitForTimeout(1500);
  return await page.evaluate(() => {
    const pop = [...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].pop();
    const scope = pop || document.body;
    return {
      found: !!pop,
      role: pop && pop.getAttribute('role'),
      text: scope.innerText.replace(/\n+/g,' | ').slice(0,400),
      buttons: [...scope.querySelectorAll('button')].map(b=>({
        l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40),
        t:b.getAttribute('data-testid'), d:b.disabled
      })).slice(0,30)
    };
  });
};
