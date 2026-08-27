export default async ({page}) => {
  const want=process.env.QA_ITEM;
  const menus=await page.$$('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]');
  const m=menus[menus.length-1];
  if(!m) return {err:'no menu'};
  const items=await m.$$('[role="menuitem"],[role="option"],button');
  let clicked=null;
  for(const e of items){ const l=((await e.getAttribute('aria-label'))||(await e.textContent())||'').trim();
    if(l.startsWith(want)){ await e.click(); clicked=l.slice(0,40); break; } }
  await page.waitForTimeout(Number(process.env.QA_WAIT||6000));
  return {clicked};
};
