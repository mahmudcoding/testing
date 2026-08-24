export default async ({page}) => {
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1200);
  return await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg) return 'no dialog';
    return [...dlg.querySelectorAll('[data-testid],input,button')].map(e =>
      `${e.tagName.toLowerCase()}${e.type?'['+e.type+']':''} testid=${e.getAttribute('data-testid')||'-'} id=${e.id||'-'} name=${e.getAttribute('name')||'-'} val=${e.value||'-'} label=${(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,45)}`);
  });
};
