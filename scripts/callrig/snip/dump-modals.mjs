export default async ({page}) => await page.evaluate(() => {
  const pops = [...document.querySelectorAll('[role="menu"],[role="dialog"],[role="alertdialog"],[data-radix-popper-content-wrapper]')];
  return pops.map(p=>({role:p.getAttribute('role'), tid:p.getAttribute('data-testid'),
    text:p.innerText.replace(/\n+/g,' | ').slice(0,700),
    items:[...p.querySelectorAll('button,[role="menuitem"],input')].map(b=>`${b.tagName}:${(b.getAttribute('aria-label')||b.textContent||b.value||'').trim().slice(0,40)}${b.getAttribute('data-testid')?'#'+b.getAttribute('data-testid'):''}`).filter(Boolean)}));
});
