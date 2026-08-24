export default async ({page}) => {
  const rb = page.locator('[role="dialog"] button', {hasText:/^Repeat$/}).first();
  const info = {};
  info.rruleBefore = await page.evaluate(()=>{const b=[...document.querySelectorAll('[role="dialog"] button')].find(x=>/Custom RRULE/.test(x.textContent)); return {ariaDisabled:b.getAttribute('aria-disabled'), disabled:b.disabled, cursor:getComputedStyle(b).cursor};});
  if (await rb.count()) { await rb.click(); await page.waitForTimeout(1500); }
  info.menu = await page.evaluate(()=>{
    const menus=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')];
    return menus.map(m=>({role:m.getAttribute('role'), items:[...m.querySelectorAll('[role="menuitem"],[role="option"],button')].map(i=>i.textContent.trim().slice(0,40))})).slice(-2);
  });
  return info;
};
