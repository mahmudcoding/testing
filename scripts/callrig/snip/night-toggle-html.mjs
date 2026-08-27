export default async ({page}) => {
  return await page.evaluate(() => {
    const b=document.querySelector('[data-testid="admin-permission-can_manage_chat"]');
    if(!b) return {none:true};
    const lbl = b.getAttribute('aria-labelledby');
    const ref = lbl ? document.getElementById(lbl) : null;
    return {
      outer: b.outerHTML.replace(/\s+/g,' ').slice(0,500),
      ariaLabelledby: lbl, refText: ref?ref.innerText.slice(0,60):null,
      role: b.getAttribute('role'), ariaChecked: b.getAttribute('aria-checked'),
      parentText: b.parentElement?b.parentElement.innerText.replace(/\n+/g,' | ').slice(0,120):null
    };
  });
};
