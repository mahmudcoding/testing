export default async ({page}) => {
  return await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    return [...dlg.querySelectorAll('input[type=radio]')].map(r => {
      const lab = document.querySelector('label[for="'+r.id+'"]') || r.closest('label');
      return {id:r.id, name:r.name, checked:r.checked, value:r.value,
              testid: r.getAttribute('data-testid') || (r.closest('[data-testid]')||{}).getAttribute?.('data-testid'),
              label: lab? lab.innerText.replace(/\n+/g,' ').trim().slice(0,60) : null};
    });
  });
};
