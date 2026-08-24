export default async ({page}) => {
  const ctl = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    const nodes=[...d.querySelectorAll('*')].filter(e=>/Does not repeat/.test(e.textContent) && e.children.length<=1);
    return nodes.map(e=>({tag:e.tagName, role:e.getAttribute('role'), tid:e.getAttribute('data-testid'), cls:(e.className||'').toString().slice(0,50), txt:e.textContent.trim().slice(0,30)})).slice(0,5);
  });
  // click whatever holds "Does not repeat"
  await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    const n=[...d.querySelectorAll('button,[role=combobox],select')].find(e=>/Does not repeat/.test(e.textContent));
    if (n) { n.setAttribute('data-qa-rep','1'); }
  });
  const t = page.locator('[data-qa-rep="1"]');
  let opened=false;
  if (await t.count()) { await t.click(); await page.waitForTimeout(1500); opened=true; }
  const menu = await page.evaluate(()=>{
    const menus=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')];
    return menus.map(m=>({role:m.getAttribute('role'), items:[...m.querySelectorAll('[role="menuitem"],[role="option"],button,div')].map(i=>i.textContent.trim().slice(0,40)).filter(Boolean).slice(0,12)})).slice(-2);
  });
  return {ctl, opened, menu};
};
