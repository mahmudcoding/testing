export default async ({page}) => {
  const sel = await page.$('button[aria-label="Select camera"]');
  if (!sel) return {err:'no camera selector'};
  await sel.click(); await page.waitForTimeout(2200);
  const r = await page.evaluate(()=>{
    const m=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')].pop();
    if(!m) return 'no menu';
    return {text:m.innerText.replace(/\n+/g,' | ').slice(0,220),
      items:[...m.querySelectorAll('button,[role="option"],[role="menuitem"],[role="menuitemradio"]')].map(b=>({t:(b.textContent||'').trim().slice(0,28), checked:b.getAttribute('aria-checked'), sel:b.getAttribute('aria-selected'), state:b.getAttribute('data-state')}))};
  });
  await page.keyboard.press('Escape');
  return r;
};
