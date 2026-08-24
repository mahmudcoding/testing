export default async ({page}) => {
  const tb = page.locator('[data-testid="call-toolbar"] button', {hasText:''});
  const more = page.locator('[data-testid="call-toolbar"] button[aria-label="More"]').first();
  if (!(await more.count())) return {err:'no More'};
  await more.click();
  await page.waitForTimeout(1200);
  return await page.evaluate(() => {
    const menus = [...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper],[role="dialog"]')];
    return menus.map(m => ({
      role: m.getAttribute('role'),
      text: m.innerText.replace(/\n+/g,' | ').slice(0,500),
      items: [...m.querySelectorAll('[role="menuitem"],[role="menuitemcheckbox"],button')].map(i=>`${(i.getAttribute('aria-label')||i.textContent||'').trim().slice(0,40)}#${i.getAttribute('data-testid')||'-'}${i.getAttribute('aria-checked')!=null?' checked='+i.getAttribute('aria-checked'):''}${i.disabled?' DISABLED':''}`)
    })).slice(-3);
  });
};
