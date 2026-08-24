export default async ({page}) => {
  return await page.evaluate(() => {
    const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
    const rows = [...dlg.querySelectorAll('input[type=checkbox]')].map(c => {
      const row = c.closest('label') || c.closest('li') || c.parentElement;
      return {name: c.getAttribute('aria-label'), disabled: c.disabled, checked: c.checked,
              ariaDisabled: c.getAttribute('aria-disabled'),
              rowText: (row? row.innerText:'').replace(/\n+/g,' ').trim().slice(0,40),
              pe: getComputedStyle(c).pointerEvents, op: getComputedStyle(row||c).opacity};
    });
    const search = dlg.querySelector('input[type=search]');
    return {rows, searchPlaceholder: search && search.placeholder,
      sectionHeaders: [...dlg.querySelectorAll('*')].filter(e=>e.children.length===0 && /MEMBERS|LINK/i.test(e.textContent)).map(e=>e.textContent.trim()).slice(0,5)};
  });
};
